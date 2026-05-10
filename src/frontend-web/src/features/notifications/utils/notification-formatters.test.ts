import { describe, expect, it } from "vitest";
import type { Notification } from "../types/notification";
import {
	formatNotificationDate,
	formatRelatedRecord,
	getNotificationIcon,
	getNotificationTypeClasses,
	getUserLabel,
} from "./notification-formatters";

function makeNotification(
	overrides: Partial<Notification> = {},
): Notification {
	return {
		id: 1,
		user_id: 2,
		type: "Reserva Confirmada",
		message: "ok",
		is_read: false,
		reservation_id: 10,
		occurrence_id: null,
		delivery_id: null,
		...overrides,
	};
}

describe("notification-formatters", () => {
	it("retorna classes por tipo", () => {
		expect(getNotificationTypeClasses("Encomenda chegou")).toContain("blue");
		expect(getNotificationTypeClasses("Reserva Cancelada")).toContain("rose");
		expect(getNotificationTypeClasses("Reserva Confirmada")).toContain("emerald");
		expect(getNotificationTypeClasses("Outro")).toContain("slate");
	});

	it("retorna ícone por tipo", () => {
		expect(getNotificationIcon("Encomenda")).toBe("package_2");
		expect(getNotificationIcon("Cancelada")).toBe("event_busy");
		expect(getNotificationIcon("Reserva")).toBe("event_available");
		expect(getNotificationIcon("Outro")).toBe("notifications");
	});

	it("resolve label de usuário com fallback", () => {
		expect(getUserLabel({ id: 1, username: "Ana", email: null, profile: null })).toBe(
			"Ana",
		);
		expect(getUserLabel(undefined, 5)).toBe("ID 5");
		expect(getUserLabel()).toBe("-");
	});

	it("formata vínculo relacionado", () => {
		expect(formatRelatedRecord(makeNotification({ delivery_id: 99, reservation_id: null }))).toBe(
			"Encomenda #99",
		);
		expect(formatRelatedRecord(makeNotification({ delivery_id: null, reservation_id: 88 }))).toBe(
			"Reserva #88",
		);
		expect(formatRelatedRecord(makeNotification({ delivery_id: null, reservation_id: null, occurrence_id: 77 }))).toBe(
			"Ocorrencia #77",
		);
		expect(formatRelatedRecord(makeNotification({ delivery_id: null, reservation_id: null, occurrence_id: null }))).toBe(
			"Sem vinculo",
		);
	});

	it("formata data e fallback", () => {
		expect(formatNotificationDate(null)).toBe("Data indisponivel");
		expect(formatNotificationDate("2026-05-10T10:00:00.000Z")).toContain(
			"10/05/2026",
		);
	});
});
