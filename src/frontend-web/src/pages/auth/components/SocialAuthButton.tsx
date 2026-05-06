import type { CSSProperties, ReactNode } from "react";

type SocialAuthButtonProps = {
	provider?: string;
	children?: ReactNode;
	imageAlt?: string;
	imageSrc?: string;
	icon?: ReactNode;
	className?: string;
	style?: CSSProperties;
};

export function SocialAuthButton({
	children,
	imageAlt,
	imageSrc,
	icon,
	className = "",
	style,
	provider,
}: SocialAuthButtonProps) {
	const handleClick = async () => {
		try {
			const prov = provider ?? "social";

			// Google PKCE flow if client id is configured
			if (prov === "google" && import.meta.env.VITE_GOOGLE_CLIENT_ID) {
				const { generateCodeVerifier, generateCodeChallenge } = await import("#/utils/pkce");
				const codeVerifier = await generateCodeVerifier();
				const codeChallenge = await generateCodeChallenge(codeVerifier);

				// Persist verifier temporarily
				sessionStorage.setItem(`pkce_${prov}`, codeVerifier);

				const state = btoa(JSON.stringify({ provider: prov }));
				const redirect = `${window.location.origin}/oauth-callback.html`;
				const params = new URLSearchParams({
					client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
					response_type: "code",
					scope: "openid email profile",
					redirect_uri: redirect,
					code_challenge: codeChallenge,
					code_challenge_method: "S256",
					state,
					access_type: "offline",
					prompt: "consent",
				});

				const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
				const popup = window.open(url, "oauth", "width=500,height=700");
				if (!popup) throw new Error("Falha ao abrir janela de autenticação.");

				// Listen for callback message from oauth-callback.html
				const listener = async (ev: MessageEvent) => {
					if (ev.origin !== window.location.origin) return;
					const { code, state: returnedState, error } = ev.data ?? {};
					if (error) {
						window.removeEventListener("message", listener);
						alert(`Erro no provedor: ${error}`);
						return;
					}
					if (!code || !returnedState) return;
					try {
						const st = JSON.parse(atob(returnedState));
						if (st.provider !== prov) throw new Error("State mismatch");

						const codeVerifier = sessionStorage.getItem(`pkce_${prov}`) || undefined;
						sessionStorage.removeItem(`pkce_${prov}`);

						// Exchange code with backend
						const resp = await fetch(`/api/Users/exchange-code`, {
							method: "POST",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify({ provider: prov, code, codeVerifier, redirectUri: `${window.location.origin}/oauth-callback.html` }),
						});
						if (!resp.ok) {
							const text = await resp.text();
							throw new Error(text || "Exchange failed");
						}
						const json = await resp.json();
						const auth = await import("#/services/auth-service");
						auth.saveAuthToken(json.token);
						auth.saveAuthUser(json.user);
						window.removeEventListener("message", listener);
						window.location.href = "/deliveries";
					} catch (ex) {
						window.removeEventListener("message", listener);
						// eslint-disable-next-line no-console
						console.error(ex);
						alert("Falha ao completar login social.");
					}
				};

				window.addEventListener("message", listener);
				return;
			}

			// Fallback: use backend exchange endpoint if configured (development)
			const providerSubject = `dev-${prov}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
			const payload = {
				provider: prov,
				providerSubject,
				email: null,
				name: null,
				emailVerified: false,
			} as any;

			const auth = await import("#/services/auth-service");
			const result = await auth.exchangeSocial(payload);
			if (result?.token) {
				auth.saveAuthToken(result.token);
				auth.saveAuthUser(result.user);
				window.location.href = "/deliveries";
			}
		} catch (err) {
			// eslint-disable-next-line no-console
			console.error("Social login failed", err);
			alert("Falha no login social. Veja o console para mais detalhes.");
		}
	};

	return (
		<button
			className={[
				"flex items-center justify-center gap-2 border border-gray-200 py-3 rounded-xl hover:bg-gray-50 transition-colors",
				className,
			]
				.filter(Boolean)
				.join(" ")}
			style={style}
				type="button"
				onClick={handleClick}
		>
			{imageSrc && imageAlt && (
				<img alt={imageAlt} className="h-5 w-5" src={imageSrc} />
			)}
			{icon}
			{children}
		</button>
	);
}
