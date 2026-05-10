import { beforeEach, describe, expect, it, vi } from "vitest";
import { getAuthToken } from "#/services/auth-service";
import { apiRequest } from "#/services/api-client";
import {
	createOccurrence,
	deleteOccurrence,
	fetchAllOccurrences,
	fetchMyOccurrences,
	updateOccurrence,
	uploadOccurrenceImage,
} from "./occurrences-service";

vi.mock("#/services/api-client", () => ({
	apiRequest: vi.fn(),
}));

vi.mock("#/services/auth-service", () => ({
	getAuthToken: vi.fn(),
}));

describe("occurrences-service", () => {
	beforeEach(() => {
		vi.mocked(getAuthToken).mockReturnValue("token-o");
	});

	it("busca ocorrências do usuário e todas ocorrências", () => {
		fetchMyOccurrences();
		fetchAllOccurrences();

		expect(apiRequest).toHaveBeenNthCalledWith(1, "/api/Occurrences/meu", {
			headers: { Authorization: "Bearer token-o" },
		});
		expect(apiRequest).toHaveBeenNthCalledWith(2, "/api/Occurrences", {
			headers: { Authorization: "Bearer token-o" },
		});
	});

	it("cria e atualiza ocorrência com JSON", () => {
		const payload = {
			title: "Portão quebrado",
			description: "Detalhes",
			status: "Aberto" as const,
			imageUrl: "",
		};

		createOccurrence(payload);
		updateOccurrence(5, payload);

		expect(apiRequest).toHaveBeenNthCalledWith(1, "/api/Occurrences", {
			method: "POST",
			headers: {
				Authorization: "Bearer token-o",
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				title: payload.title,
				description: payload.description,
			}),
		});
		expect(apiRequest).toHaveBeenNthCalledWith(2, "/api/Occurrences/5", {
			method: "PUT",
			headers: {
				Authorization: "Bearer token-o",
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		});
	});

	it("envia imagem usando FormData e sem Content-Type manual", () => {
		const file = new File(["abc"], "img.png", { type: "image/png" });
		uploadOccurrenceImage(8, file);

		const [, options] = vi.mocked(apiRequest).mock.calls[0] as [
			string,
			RequestInit,
		];

		expect(apiRequest).toHaveBeenCalledWith("/api/Occurrences/8/images", {
			method: "POST",
			headers: { Authorization: "Bearer token-o" },
			body: expect.any(FormData),
		});
		expect(options.body).toBeInstanceOf(FormData);
	});

	it("remove ocorrência", () => {
		deleteOccurrence(4);
		expect(apiRequest).toHaveBeenCalledWith("/api/Occurrences/4", {
			method: "DELETE",
			headers: { Authorization: "Bearer token-o" },
		});
	});
});
