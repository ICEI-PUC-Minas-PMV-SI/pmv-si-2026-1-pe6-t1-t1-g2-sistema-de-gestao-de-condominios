import { beforeEach, describe, expect, it, vi } from "vitest";
import { getAuthToken } from "#/services/auth-service";
import { apiRequest } from "#/services/api-client";
import {
	createResident,
	deleteResident,
	fetchResidents,
	updateResident,
} from "./residents-service";

vi.mock("#/services/api-client", () => ({
	apiRequest: vi.fn(),
}));

vi.mock("#/services/auth-service", () => ({
	getAuthToken: vi.fn(),
}));

describe("residents-service", () => {
	beforeEach(() => {
		vi.mocked(getAuthToken).mockReturnValue("token-r");
	});

	it("lista moradores", () => {
		fetchResidents();
		expect(apiRequest).toHaveBeenCalledWith("/api/Users", {
			headers: { Authorization: "Bearer token-r" },
		});
	});

	it("cria morador com contrato esperado", () => {
		createResident({
			username: "Ana",
			email: "ana@x.com",
			password: "123",
		});

		expect(apiRequest).toHaveBeenCalledWith("/api/Users", {
			method: "POST",
			headers: { Authorization: "Bearer token-r" },
			body: JSON.stringify({
				username: "Ana",
				email: "ana@x.com",
				password_hash: "123",
				profile: "Morador",
			}),
		});
	});

	it("atualiza e remove morador", () => {
		updateResident(11, {
			username: "Novo Nome",
			email: "novo@x.com",
			profile: "Administrador",
			status: "Ativo",
		});
		deleteResident(11);

		expect(apiRequest).toHaveBeenNthCalledWith(1, "/api/Users/11", {
			method: "PUT",
			headers: { Authorization: "Bearer token-r" },
			body: JSON.stringify({
				username: "Novo Nome",
				email: "novo@x.com",
				profile: "Administrador",
			}),
		});
		expect(apiRequest).toHaveBeenNthCalledWith(2, "/api/Users/11", {
			method: "DELETE",
			headers: { Authorization: "Bearer token-r" },
		});
	});
});
