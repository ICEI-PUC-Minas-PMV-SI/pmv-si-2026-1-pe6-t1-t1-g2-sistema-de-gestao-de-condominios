import { describe, expect, it } from "vitest";
import { calculateResidentStats } from "./resident-stats";

describe("calculateResidentStats", () => {
	it("considera apenas usuários com perfil morador", () => {
		const result = calculateResidentStats([
			{ id: 1, username: "A", email: "a@x.com", profile: "Morador" },
			{ id: 2, username: "B", email: "b@x.com", profile: "Administrador" },
			{ id: 3, username: "C", email: "c@x.com", profile: "morador" },
		]);

		expect(result.totalResidents).toBe(2);
		expect(result.newThisMonth).toBe(2);
	});
});
