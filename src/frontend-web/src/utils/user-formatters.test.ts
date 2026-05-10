import { describe, expect, it } from "vitest";
import { getAvatarUrl, getProfileLabel } from "./user-formatters";

describe("user-formatters", () => {
	it("normaliza labels de perfil", () => {
		expect(getProfileLabel("Administrador")).toBe("Administrador");
		expect(getProfileLabel("morador")).toBe("Morador");
		expect(getProfileLabel(null)).toBe("Perfil");
	});

	it("gera avatar com nome codificado e cor por perfil", () => {
		const adminUrl = getAvatarUrl("Ana Silva", "Administrador");
		const moradorUrl = getAvatarUrl("Ana Silva", "Morador");

		expect(adminUrl).toContain("name=Ana%20Silva");
		expect(adminUrl).toContain("background=2f4f8f");
		expect(moradorUrl).toContain("background=2f6a4a");
	});
});
