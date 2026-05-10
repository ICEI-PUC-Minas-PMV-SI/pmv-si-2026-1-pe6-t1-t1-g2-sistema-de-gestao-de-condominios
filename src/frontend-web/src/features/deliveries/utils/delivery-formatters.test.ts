import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Delivery } from "../types/delivery";
import {
	formatDateTime,
	getDeliveryUserLabel,
	getStatusClasses,
	getUserLabel,
	isPickedUp,
	isToday,
	isWaitingPickup,
} from "./delivery-formatters";

function makeDelivery(overrides: Partial<Delivery> = {}): Delivery {
	return {
		id: 1,
		recipient_user_id: 10,
		recipient_username: "Maria",
		recipient_email: "maria@x.com",
		registered_by_user_id: 2,
		registered_by_username: "Admin",
		registered_by_email: "admin@x.com",
		description: "Pacote",
		arrival_date: "2026-05-10T10:00:00.000Z",
		pickup_date: null,
		status: "Disponível para retirada",
		...overrides,
	};
}

describe("delivery-formatters", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-05-10T12:00:00.000Z"));
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("identifica datas de hoje", () => {
		expect(isToday("2026-05-10T15:00:00.000Z")).toBe(true);
		expect(isToday("2026-05-09T12:00:00.000Z")).toBe(false);
	});

	it("classifica status de retirada", () => {
		expect(isWaitingPickup("Disponível para Retirada")).toBe(true);
		expect(isWaitingPickup("Registrada")).toBe(false);
	});

	it("considera entrega retirada por data ou status", () => {
		expect(isPickedUp(makeDelivery({ pickup_date: "2026-05-10T11:00:00.000Z" }))).toBe(
			true,
		);
		expect(isPickedUp(makeDelivery({ status: "Entregue", pickup_date: null }))).toBe(
			true,
		);
		expect(isPickedUp(makeDelivery({ status: "Registrada", pickup_date: null }))).toBe(
			false,
		);
	});

	it("formata data e fallback", () => {
		expect(formatDateTime(undefined)).toBe("-");
		expect(formatDateTime("2026-05-10T10:00:00.000Z")).toContain("10/05/2026");
	});

	it("monta labels de usuário com fallback", () => {
		expect(getUserLabel({ username: "Ana", email: null }, 2)).toBe("Ana");
		expect(getUserLabel({ username: null, email: "a@x.com" }, 2)).toBe("a@x.com");
		expect(getUserLabel(undefined, 2)).toBe("ID 2");
		expect(getDeliveryUserLabel(undefined, undefined, null)).toBe("-");
	});

	it("define classes visuais por status", () => {
		expect(getStatusClasses("Disponível para retirada")).toContain("amber");
		expect(getStatusClasses("Entregue")).toContain("emerald");
		expect(getStatusClasses("Registrada")).toContain("slate");
	});
});
