import { beforeEach, describe, expect, it, vi } from "vitest";
import { getAuthToken } from "#/services/auth-service";
import { apiRequest } from "#/services/api-client";
import {
	createDelivery,
	deleteDelivery,
	fetchDeliveries,
	fetchDeliveryUsers,
	updateDelivery,
} from "./deliveries-service";

vi.mock("#/services/api-client", () => ({
	apiRequest: vi.fn(),
}));

vi.mock("#/services/auth-service", () => ({
	getAuthToken: vi.fn(),
}));

describe("deliveries-service", () => {
	beforeEach(() => {
		vi.mocked(getAuthToken).mockReturnValue("token-x");
	});

	it("busca encomendas com ou sem filtro de destinatário", () => {
		fetchDeliveries();
		fetchDeliveries(9);

		expect(apiRequest).toHaveBeenNthCalledWith(1, "/api/Deliveries", {
			headers: { Authorization: "Bearer token-x" },
		});
		expect(apiRequest).toHaveBeenNthCalledWith(
			2,
			"/api/Deliveries?recipientUserId=9",
			{
				headers: { Authorization: "Bearer token-x" },
			},
		);
	});

	it("busca usuários para destinatário", () => {
		fetchDeliveryUsers();
		expect(apiRequest).toHaveBeenCalledWith("/api/Users", {
			headers: { Authorization: "Bearer token-x" },
		});
	});

	it("cria, atualiza e remove encomenda", () => {
		const payload = {
			recipient_user_id: 1,
			description: "Pacote",
			arrival_date: "2026-05-10T10:00:00.000Z",
			pickup_date: null,
			status: "Registrada",
		};

		createDelivery(payload);
		updateDelivery(7, payload);
		deleteDelivery(7);

		expect(apiRequest).toHaveBeenNthCalledWith(1, "/api/Deliveries", {
			method: "POST",
			headers: { Authorization: "Bearer token-x" },
			body: JSON.stringify(payload),
		});
		expect(apiRequest).toHaveBeenNthCalledWith(2, "/api/Deliveries/7", {
			method: "PUT",
			headers: { Authorization: "Bearer token-x" },
			body: JSON.stringify(payload),
		});
		expect(apiRequest).toHaveBeenNthCalledWith(3, "/api/Deliveries/7", {
			method: "DELETE",
			headers: { Authorization: "Bearer token-x" },
		});
	});
});
