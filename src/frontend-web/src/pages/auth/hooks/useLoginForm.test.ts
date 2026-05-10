import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { withQueryClient } from "#/test/query-client";
import {
	loginUser,
	saveAuthToken,
	saveAuthUser,
} from "#/services/auth-service";
import { useLoginForm } from "./useLoginForm";

const navigateMock = vi.fn();

vi.mock("@tanstack/react-router", async () => {
	const actual = await vi.importActual<typeof import("@tanstack/react-router")>(
		"@tanstack/react-router",
	);
	return {
		...actual,
		useNavigate: () => navigateMock,
	};
});

vi.mock("#/services/auth-service", () => ({
	loginUser: vi.fn(),
	saveAuthToken: vi.fn(),
	saveAuthUser: vi.fn(),
}));

describe("useLoginForm", () => {
	beforeEach(() => {
		navigateMock.mockReset();
	});

	it("atualiza campos e alterna visibilidade da senha", () => {
		const { result } = renderHook(() => useLoginForm(), {
			wrapper: withQueryClient(),
		});

		act(() => {
			result.current.updateField("email")({
				target: { value: "ana@x.com" },
			} as React.ChangeEvent<HTMLInputElement>);
			result.current.updateField("password")({
				target: { value: "123456" },
			} as React.ChangeEvent<HTMLInputElement>);
		});

		expect(result.current.form).toEqual({
			email: "ana@x.com",
			password: "123456",
		});

		act(() => result.current.togglePasswordVisibility());
		expect(result.current.isPasswordVisible).toBe(true);
	});

	it("valida e-mail antes de chamar loginUser", async () => {
		const { result } = renderHook(() => useLoginForm(), {
			wrapper: withQueryClient(),
		});

		act(() => {
			result.current.updateField("email")({
				target: { value: "email-invalido" },
			} as React.ChangeEvent<HTMLInputElement>);
			result.current.updateField("password")({
				target: { value: "123456" },
			} as React.ChangeEvent<HTMLInputElement>);
			result.current.handleSubmit({
				preventDefault: vi.fn(),
			} as unknown as React.FormEvent<HTMLFormElement>);
		});

		await waitFor(() => {
			expect(result.current.mutation.isError).toBe(true);
		});
		expect(loginUser).not.toHaveBeenCalled();
	});

	it("executa login com sucesso e navega para /deliveries", async () => {
		vi.mocked(loginUser).mockResolvedValueOnce({
			token: "abc",
			user: { id: 1, username: "Ana", email: "ana@x.com", profile: "Morador" },
		});

		const { result } = renderHook(() => useLoginForm(), {
			wrapper: withQueryClient(),
		});

		act(() => {
			result.current.updateField("email")({
				target: { value: "ana@x.com" },
			} as React.ChangeEvent<HTMLInputElement>);
			result.current.updateField("password")({
				target: { value: "123456" },
			} as React.ChangeEvent<HTMLInputElement>);
			result.current.handleSubmit({
				preventDefault: vi.fn(),
			} as unknown as React.FormEvent<HTMLFormElement>);
		});

		await waitFor(() => {
			expect(loginUser).toHaveBeenCalledWith({
				email: "ana@x.com",
				password: "123456",
			});
		});
		expect(saveAuthToken).toHaveBeenCalledWith("abc");
		expect(saveAuthUser).toHaveBeenCalledWith({
			id: 1,
			username: "Ana",
			email: "ana@x.com",
			profile: "Morador",
		});
		expect(navigateMock).toHaveBeenCalledWith({ to: "/deliveries" });
	});
});
