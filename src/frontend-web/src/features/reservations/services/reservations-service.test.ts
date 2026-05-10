import { beforeEach, describe, expect, it, vi } from "vitest";
import { getAuthToken } from "#/services/auth-service";
import { apiRequest } from "#/services/api-client";
import {
	createReservation,
	deleteReservation,
	fetchReservations,
	updateReservation,
} from "./reservations-service";

vi.mock("#/services/api-client", () => ({
	apiRequest: vi.fn(),
}));

vi.mock("#/services/auth-service", () => ({
	getAuthToken: vi.fn(),
}));

describe("reservations-service", () => {
	beforeEach(() => {
		vi.mocked(getAuthToken).mockReturnValue("token-z");
	});

	it("mapeia resposta da API no fetchReservations", async () => {
		vi.mocked(apiRequest).mockResolvedValueOnce([
			{
				Id: 3,
				CommonAreaId: 12,
				UserId: 9,
				StartTime: "2026-05-10T10:00:00.000Z",
				EndTime: "2026-05-10T11:00:00.000Z",
				Status: "Pendente",
				CreatedAt: null,
				UpdatedAt: null,
			},
		]);

		const result = await fetchReservations();

		expect(result).toEqual([
			{
				id: 3,
				areaComumId: 12,
				moradorId: 9,
				dataHoraInicio: "2026-05-10T10:00:00.000Z",
				dataHoraFim: "2026-05-10T11:00:00.000Z",
				status: "Pendente",
				createdAt: null,
				updatedAt: null,
			},
		]);
		expect(apiRequest).toHaveBeenCalledWith("/api/reservas", {
			headers: { Authorization: "Bearer token-z" },
		});
	});

	it("cria reserva com payload normalizado", async () => {
		vi.mocked(apiRequest).mockResolvedValueOnce({
			id: 1,
			common_area_id: 2,
			user_id: 5,
			start_time: "2026-05-10T13:00:00.000Z",
			end_time: "2026-05-10T14:00:00.000Z",
			status: "Pendente",
			createdAt: null,
			updatedAt: null,
		});

		await createReservation(
			{
				areaComumId: "2",
				dataInicio: "2026-05-10",
				horaInicio: "10:00",
				dataFim: "2026-05-10",
				horaFim: "11:00",
				status: "Pendente",
			},
			5,
		);

		const [, request] = vi.mocked(apiRequest).mock.calls[0] as [
			string,
			RequestInit,
		];
		const body = JSON.parse(String(request.body)) as Record<string, unknown>;

		expect(body.common_area_id).toBe(2);
		expect(body.user_id).toBe(5);
		expect(body.start_time).toBe(new Date("2026-05-10T10:00").toISOString());
		expect(body.end_time).toBe(new Date("2026-05-10T11:00").toISOString());
	});

	it("atualiza e remove reserva", async () => {
		vi.mocked(apiRequest).mockResolvedValueOnce({
			id: 7,
			common_area_id: 2,
			user_id: 5,
			start_time: "2026-05-10T10:00:00.000Z",
			end_time: "2026-05-10T11:00:00.000Z",
			status: "Aprovada",
			createdAt: null,
			updatedAt: null,
		});

		await updateReservation(7, {
			id: 7,
			areaComumId: 2,
			moradorId: 5,
			dataHoraInicio: "2026-05-10T10:00:00.000Z",
			dataHoraFim: "2026-05-10T11:00:00.000Z",
			status: "Aprovada",
			createdAt: null,
			updatedAt: null,
		});
		deleteReservation(7);

		expect(apiRequest).toHaveBeenNthCalledWith(1, "/api/reservas/7", {
			method: "PUT",
			headers: { Authorization: "Bearer token-z" },
			body: JSON.stringify({
				common_area_id: 2,
				user_id: 5,
				start_time: new Date("2026-05-10T10:00:00.000Z").toISOString(),
				end_time: new Date("2026-05-10T11:00:00.000Z").toISOString(),
				status: "Aprovada",
			}),
		});
		expect(apiRequest).toHaveBeenNthCalledWith(2, "/api/reservas/7", {
			method: "DELETE",
			headers: { Authorization: "Bearer token-z" },
		});
	});
});
