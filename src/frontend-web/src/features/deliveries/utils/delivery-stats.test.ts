import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Delivery } from "../types/delivery";
import { calculateDeliveryStats } from "./delivery-stats";

describe("calculateDeliveryStats", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-05-10T12:00:00.000Z"));
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("calcula métricas do dashboard", () => {
		const deliveries: Delivery[] = [
			{
				id: 1,
				recipient_user_id: 1,
				recipient_username: null,
				recipient_email: null,
				registered_by_user_id: 2,
				registered_by_username: null,
				registered_by_email: null,
				description: null,
				arrival_date: "2026-05-10T08:00:00.000Z",
				pickup_date: null,
				status: "Disponível para retirada",
			},
			{
				id: 2,
				recipient_user_id: 1,
				recipient_username: null,
				recipient_email: null,
				registered_by_user_id: 2,
				registered_by_username: null,
				registered_by_email: null,
				description: null,
				arrival_date: "2026-05-09T08:00:00.000Z",
				pickup_date: "2026-05-10T09:00:00.000Z",
				status: "Entregue",
			},
		];

		expect(calculateDeliveryStats(deliveries)).toEqual({
			receivedToday: 1,
			waitingPickup: 1,
			pickedUpToday: 1,
			inStorage: 1,
		});
	});
});
