import { describe, expect, it } from "vitest";
import {
	formatNumber,
	formatPercentage,
	getStatusClasses,
	getStatusDotClass,
} from "./resident-formatters";

describe("resident-formatters", () => {
	it("formata número e porcentagem", () => {
		expect(formatNumber(1200)).toBe("1.200");
		expect(formatPercentage(42)).toBe("42%");
	});

	it("retorna classes corretas por status", () => {
		expect(getStatusClasses("Ativo")).toContain("emerald");
		expect(getStatusClasses("Inativo")).toContain("slate");
		expect(getStatusDotClass("Ativo")).toContain("emerald");
		expect(getStatusDotClass("Inativo")).toContain("slate");
	});
});
