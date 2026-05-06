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
			// debug logs to trace click handling
			// eslint-disable-next-line no-console
			console.log("SocialAuthButton clicked", prov);

			if (prov === "google") {
				// Try using Supabase client flow first
				const { supabase } = await import("#/services/supabase-client");
				// eslint-disable-next-line no-console
				console.log("supabase module loaded", !!supabase);
				const { error } = await supabase.auth.signInWithOAuth({
					provider: "google",
					options: {
						redirectTo: `${window.location.origin}/auth/callback`,
						queryParams: {
							access_type: "offline",
							prompt: "consent",
						},
					},
				});
				if (error) {
					throw error;
				}
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
