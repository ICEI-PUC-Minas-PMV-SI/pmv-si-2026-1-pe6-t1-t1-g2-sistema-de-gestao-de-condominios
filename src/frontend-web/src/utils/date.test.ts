import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { formatTimeAgo } from "./date";

describe("formatTimeAgo", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-05-10T15:00:00.000Z"));
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("retorna agora mesmo para diferença menor que 1 minuto", () => {
		expect(formatTimeAgo("2026-05-10T14:59:50.000Z")).toBe("agora mesmo");
	});

	it("retorna minutos para diferenças menores que 1 hora", () => {
		expect(formatTimeAgo("2026-05-10T14:45:00.000Z")).toBe("há 15 minutos");
	});

	it("retorna horas para diferenças menores que 24 horas", () => {
		expect(formatTimeAgo("2026-05-10T12:00:00.000Z")).toBe("há 3 horas");
	});

	it("retorna dias para diferenças maiores que 24 horas", () => {
		expect(formatTimeAgo("2026-05-08T15:00:00.000Z")).toBe("há 2 dias");
	});
});
