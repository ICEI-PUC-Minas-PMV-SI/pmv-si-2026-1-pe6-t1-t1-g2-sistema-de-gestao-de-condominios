import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { exchangeSocial, saveAuthToken, saveAuthUser } from "#/services/auth-service";
import { supabase } from "#/services/supabase-client";
import { Spinner } from "#/components/ui";

export const Route = createFileRoute("/auth/callback")({
	component: AuthCallbackPage,
});

function AuthCallbackPage() {
	const navigate = useNavigate();

	useEffect(() => {
		let cancelled = false;

		async function completeLogin() {
			try {
				const url = new URL(window.location.href);
				const code = url.searchParams.get("code");
				const authError =
					url.searchParams.get("error_description") ?? url.searchParams.get("error");

				if (authError) {
					throw new Error(authError);
				}

				if (!code) {
					throw new Error("Código OAuth ausente na callback do Supabase.");
				}

				const { data, error } = await supabase.auth.exchangeCodeForSession(code);
				if (error) {
					throw error;
				}

				const user = data.session?.user;
				if (!user) {
					throw new Error("A Supabase não retornou uma sessão válida.");
				}

				const backendAuth = await exchangeSocial({
					provider: (user.app_metadata?.provider as string | undefined) ?? "google",
					providerSubject: user.id,
					email: user.email,
					name:
						(user.user_metadata?.full_name as string | undefined) ??
						(user.user_metadata?.name as string | undefined) ??
						(user.user_metadata?.username as string | undefined) ??
						user.email,
					emailVerified: Boolean(user.email_confirmed_at),
				});

				saveAuthToken(backendAuth.token);
				saveAuthUser(backendAuth.user);

				if (!cancelled) {
					navigate({ to: "/deliveries" });
				}
			} catch (error) {
				// eslint-disable-next-line no-console
				console.error("Falha ao concluir callback do Supabase", error);
			}
		}

		void completeLogin();

		return () => {
			cancelled = true;
		};
	}, [navigate]);

	return (
		<main className="flex min-h-screen items-center justify-center">
			<Spinner size={48} />
		</main>
	);
}