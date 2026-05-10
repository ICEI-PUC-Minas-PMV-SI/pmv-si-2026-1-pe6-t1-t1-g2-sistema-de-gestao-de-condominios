import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SocialAuthButton } from "./SocialAuthButton";

const signInWithOAuthMock = vi.fn();

vi.mock("#/services/supabase-client", () => ({
	supabase: {
		auth: {
			signInWithOAuth: signInWithOAuthMock,
		},
	},
}));

describe("SocialAuthButton", () => {
	beforeEach(() => {
		signInWithOAuthMock.mockReset();
	});

	it("dispara login com Google via Supabase", async () => {
		signInWithOAuthMock.mockResolvedValueOnce({ error: null });

		render(<SocialAuthButton provider="google">Google</SocialAuthButton>);
		fireEvent.click(screen.getByRole("button", { name: /google/i }));

		await waitFor(() => {
			expect(signInWithOAuthMock).toHaveBeenCalledTimes(1);
		});
		const [payload] = signInWithOAuthMock.mock.calls[0] as [
			{
				provider: string;
				options: {
					redirectTo: string;
					queryParams: Record<string, string>;
				};
			},
		];
		expect(payload.provider).toBe("google");
		expect(payload.options.redirectTo).toContain("/auth/callback");
	});

	it("exibe alerta quando login social falha", async () => {
		const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
		signInWithOAuthMock.mockResolvedValueOnce({
			error: new Error("oauth"),
		});

		render(<SocialAuthButton provider="google">Google</SocialAuthButton>);
		fireEvent.click(screen.getByRole("button", { name: /google/i }));

		await waitFor(() => {
			expect(alertSpy).toHaveBeenCalledTimes(1);
		});
	});
});
