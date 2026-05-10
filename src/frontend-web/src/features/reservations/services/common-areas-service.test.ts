import { beforeEach, describe, expect, it, vi } from "vitest";
import { getAuthToken } from "#/services/auth-service";
import { apiRequest } from "#/services/api-client";
import { COMMON_AREAS_MOCK } from "../mocks/common-areas-mock";
import { fetchCommonAreasWithFallback } from "./common-areas-service";

vi.mock("#/services/api-client", () => ({
	apiRequest: vi.fn(),
}));

vi.mock("#/services/auth-service", () => ({
	getAuthToken: vi.fn(),
}));

describe("common-areas-service", () => {
	beforeEach(() => {
		vi.mocked(getAuthToken).mockReturnValue("token-ca");
	});

	it("retorna dados da API quando válidos", async () => {
		vi.mocked(apiRequest).mockResolvedValueOnce([
			{ Id: 1, Name: "Salão", Capacity: 30, Rules: "Sem som alto" },
			{ Id: 0, Name: "Inválido", Capacity: 1, Rules: null },
		]);

		const result = await fetchCommonAreasWithFallback();

		expect(result).toEqual({
			areas: [{ id: 1, name: "Salão", capacity: 30, rules: "Sem som alto" }],
			isMock: false,
		});
		expect(apiRequest).toHaveBeenCalledWith("/api/areas-comuns", {
			headers: { Authorization: "Bearer token-ca" },
		});
	});

	it("usa fallback mock quando API falha", async () => {
		vi.mocked(apiRequest).mockRejectedValueOnce(new Error("erro"));

		const result = await fetchCommonAreasWithFallback();

		expect(result).toEqual({ areas: COMMON_AREAS_MOCK, isMock: true });
	});

	it("usa fallback mock quando API responde sem áreas válidas", async () => {
		vi.mocked(apiRequest).mockResolvedValueOnce([
			{ Id: 0, Name: "X", Capacity: 0, Rules: null },
		]);

		const result = await fetchCommonAreasWithFallback();

		expect(result).toEqual({ areas: COMMON_AREAS_MOCK, isMock: true });
	});
});
