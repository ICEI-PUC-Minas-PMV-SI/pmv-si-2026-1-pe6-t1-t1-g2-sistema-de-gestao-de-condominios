import { describe, expect, it } from "vitest";
import { calculateNotificationStats } from "./notification-stats";

describe("calculateNotificationStats", () => {
	it("calcula totais, lidas/não lidas e tipos de vínculo", () => {
		const stats = calculateNotificationStats([
			{
				id: 1,
				user_id: 1,
				type: "X",
				message: "a",
				is_read: false,
				reservation_id: null,
				occurrence_id: null,
				delivery_id: 10,
			},
			{
				id: 2,
				user_id: 1,
				type: "Y",
				message: "b",
				is_read: true,
				reservation_id: 11,
				occurrence_id: null,
				delivery_id: null,
			},
		]);

		expect(stats).toEqual({
			total: 2,
			unread: 1,
			read: 1,
			delivery: 1,
			reservation: 1,
		});
	});
});
