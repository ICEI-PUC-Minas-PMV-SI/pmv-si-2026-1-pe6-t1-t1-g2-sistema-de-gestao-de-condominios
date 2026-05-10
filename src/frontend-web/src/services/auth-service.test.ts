import { describe, expect, it, vi } from "vitest";
import { AUTH_TOKEN_KEY, AUTH_USER_KEY } from "#/constants/storage";
import type { AuthUser } from "#/types/auth";
import {
	clearAuthSession,
	exchangeSocial,
	getAuthToken,
	getAuthUser,
	loginUser,
	registerUser,
	saveAuthToken,
	saveAuthUser,
	updateUserProfile,
} from "./auth-service";
import { apiRequest } from "./api-client";

vi.mock("./api-client", () => ({
	apiRequest: vi.fn(),
}));

function createToken(payload: Record<string, unknown>) {
	const header = btoa(JSON.stringify({ alg: "none", typ: "JWT" }))
		.replace(/\+/g, "-")
		.replace(/\//g, "_")
		.replace(/=+$/g, "");
	const body = btoa(JSON.stringify(payload))
		.replace(/\+/g, "-")
		.replace(/\//g, "_")
		.replace(/=+$/g, "");
	return `${header}.${body}.sig`;
}

describe("auth-service", () => {
	it("registerUser mapeia payload para contrato do backend", async () => {
		vi.mocked(apiRequest).mockResolvedValueOnce({
			id: 10,
			email: "a@a.com",
			username: "A",
			profile: "Morador",
		});

		await registerUser({
			username: "A",
			email: "a@a.com",
			password: "123",
		});

		expect(apiRequest).toHaveBeenCalledWith("/api/Users", {
			method: "POST",
			body: JSON.stringify({
				username: "A",
				email: "a@a.com",
				password_hash: "123",
				profile: "Morador",
			}),
		});
	});

	it("loginUser aceita token/user em PascalCase", async () => {
		const token = createToken({ role: "Administrador" });
		vi.mocked(apiRequest).mockResolvedValueOnce({
			Token: token,
			User: {
				Id: 5,
				Username: "Admin",
				Email: "admin@x.com",
			},
		});

		const result = await loginUser({ email: "admin@x.com", password: "pw" });

		expect(result).toEqual({
			token,
			user: {
				id: 5,
				username: "Admin",
				email: "admin@x.com",
				profile: "Administrador",
			},
		});
	});

	it("loginUser lança erro quando backend não retorna token", async () => {
		vi.mocked(apiRequest).mockResolvedValueOnce({});
		await expect(loginUser({ email: "x@y.com", password: "pw" })).rejects.toThrow(
			"token",
		);
	});

	it("exchangeSocial retorna token e usuário normalizado", async () => {
		const token = createToken({ role: "Morador" });
		vi.mocked(apiRequest).mockResolvedValueOnce({
			token,
			user: { id: 42, username: "Joao", email: "j@x.com" },
		});

		const result = await exchangeSocial({
			provider: "google",
			providerSubject: "abc",
		});

		expect(result.user?.profile).toBe("Morador");
	});

	it("salva e lê token em localStorage", () => {
		saveAuthToken("abc");
		expect(getAuthToken()).toBe("abc");
	});

	it("clearAuthSession remove token e usuário", () => {
		window.localStorage.setItem(AUTH_TOKEN_KEY, "tkn");
		window.localStorage.setItem(AUTH_USER_KEY, "{}");
		clearAuthSession();
		expect(window.localStorage.getItem(AUTH_TOKEN_KEY)).toBeNull();
		expect(window.localStorage.getItem(AUTH_USER_KEY)).toBeNull();
	});

	it("getAuthUser retorna usuário salvo e injeta profile do token quando ausente", () => {
		const token = createToken({ role: "Administrador" });
		saveAuthToken(token);
		saveAuthUser({
			id: 9,
			username: "u",
			email: "u@x.com",
			profile: null,
		});

		const user = getAuthUser();

		expect(user?.profile).toBe("Administrador");
	});

	it("getAuthUser reconstrói usuário a partir do token quando não há usuário salvo", () => {
		const token = createToken({
			role: "Morador",
			nameid: 11,
			unique_name: "Maria",
			email: "maria@x.com",
		});
		saveAuthToken(token);

		const user = getAuthUser();

		expect(user).toEqual({
			id: 11,
			username: "Maria",
			email: "maria@x.com",
			profile: "Morador",
		});
	});

	it("getAuthUser retorna null para JSON inválido no storage", () => {
		window.localStorage.setItem(AUTH_USER_KEY, "{invalido");
		expect(getAuthUser()).toBeNull();
	});

	it("updateUserProfile exige autenticação", async () => {
		await expect(updateUserProfile({ username: "novo" })).rejects.toThrow(
			"não autenticado",
		);
	});

	it("updateUserProfile envia bearer token e persiste usuário", async () => {
		const token = createToken({ role: "Morador" });
		const nextUser: AuthUser = {
			id: 22,
			username: "Novo",
			email: "novo@x.com",
			profile: "Morador",
		};
		saveAuthToken(token);
		vi.mocked(apiRequest).mockResolvedValueOnce(nextUser);

		const result = await updateUserProfile({ username: "Novo" });

		expect(result).toEqual(nextUser);
		expect(apiRequest).toHaveBeenCalledWith("/api/Users/profile", {
			method: "PUT",
			headers: { Authorization: `Bearer ${token}` },
			body: JSON.stringify({ username: "Novo" }),
		});
		expect(getAuthUser()).toEqual(nextUser);
	});
});
