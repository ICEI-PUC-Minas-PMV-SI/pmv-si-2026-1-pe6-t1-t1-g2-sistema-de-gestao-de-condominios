import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { withQueryClient } from "#/test/query-client";
import { registerUser } from "#/services/auth-service";
import { useRegisterForm } from "./useRegisterForm";

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
	registerUser: vi.fn(),
}));

describe("useRegisterForm", () => {
	beforeEach(() => {
		navigateMock.mockReset();
	});

	it("atualiza formulário e alterna visibilidade da senha", () => {
		const { result } = renderHook(() => useRegisterForm(), {
			wrapper: withQueryClient(),
		});

		act(() => {
			result.current.updateField("username")({
				target: { value: "Ana" },
			} as React.ChangeEvent<HTMLInputElement>);
			result.current.updateField("email")({
				target: { value: "ana@x.com" },
			} as React.ChangeEvent<HTMLInputElement>);
			result.current.updateField("password")({
				target: { value: "123456" },
			} as React.ChangeEvent<HTMLInputElement>);
		});

		expect(result.current.form).toEqual({
			username: "Ana",
			email: "ana@x.com",
			password: "123456",
		});

		act(() => result.current.togglePasswordVisibility());
		expect(result.current.isPasswordVisible).toBe(true);
	});

	it("submete cadastro e redireciona para login", async () => {
		vi.mocked(registerUser).mockResolvedValueOnce({
			id: 1,
			username: "Ana",
			email: "ana@x.com",
			profile: "Morador",
		});

		const { result } = renderHook(() => useRegisterForm(), {
			wrapper: withQueryClient(),
		});

		act(() => {
			result.current.updateField("username")({
				target: { value: "Ana" },
			} as React.ChangeEvent<HTMLInputElement>);
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
			expect(registerUser).toHaveBeenCalledWith({
				username: "Ana",
				email: "ana@x.com",
				password: "123456",
			});
		});
		expect(navigateMock).toHaveBeenCalledWith({ to: "/login" });
	});
});
