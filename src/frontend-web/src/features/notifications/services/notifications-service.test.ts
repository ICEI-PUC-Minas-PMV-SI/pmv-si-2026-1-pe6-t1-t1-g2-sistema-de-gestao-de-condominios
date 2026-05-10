import { beforeEach, describe, expect, it, vi } from "vitest";
import { getAuthToken } from "#/services/auth-service";
import { apiRequest } from "#/services/api-client";
import {
	createNotification,
	deleteNotification,
	fetchNotifications,
	fetchNotificationUsers,
	updateNotificationReadStatus,
} from "./notifications-service";

vi.mock("#/services/api-client", () => ({
	apiRequest: vi.fn(),
}));

vi.mock("#/services/auth-service", () => ({
	getAuthToken: vi.fn(),
}));

describe("notifications-service", () => {
	beforeEach(() => {
		vi.mocked(getAuthToken).mockReturnValue("token-y");
	});

	it("consulta notificações com e sem filtro de usuário", () => {
		fetchNotifications();
		fetchNotifications(3);

		expect(apiRequest).toHaveBeenNthCalledWith(1, "/api/Notifications", {
			headers: { Authorization: "Bearer token-y" },
		});
		expect(apiRequest).toHaveBeenNthCalledWith(2, "/api/Notifications?userId=3", {
			headers: { Authorization: "Bearer token-y" },
		});
	});

	it("busca usuários e cria notificação", () => {
		const payload = {
			user_id: 3,
			type: "Reserva Confirmada",
			message: "Texto",
			is_read: false,
			reservation_id: null,
			occurrence_id: null,
			delivery_id: 8,
		};

		fetchNotificationUsers();
		createNotification(payload);

		expect(apiRequest).toHaveBeenNthCalledWith(1, "/api/Users", {
			headers: { Authorization: "Bearer token-y" },
		});
		expect(apiRequest).toHaveBeenNthCalledWith(2, "/api/Notifications", {
			method: "POST",
			headers: { Authorization: "Bearer token-y" },
			body: JSON.stringify(payload),
		});
	});

	it("atualiza status de leitura e remove notificação", () => {
		updateNotificationReadStatus(10, true);
		deleteNotification(10);

		expect(apiRequest).toHaveBeenNthCalledWith(
			1,
			"/api/Notifications/10/read-status",
			{
				method: "PATCH",
				headers: { Authorization: "Bearer token-y" },
				body: JSON.stringify({ isRead: true }),
			},
		);
		expect(apiRequest).toHaveBeenNthCalledWith(2, "/api/Notifications/10", {
			method: "DELETE",
			headers: { Authorization: "Bearer token-y" },
		});
	});
});
