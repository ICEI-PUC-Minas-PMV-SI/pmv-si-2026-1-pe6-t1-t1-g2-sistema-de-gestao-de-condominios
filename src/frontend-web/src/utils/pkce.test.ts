import { describe, expect, it } from "vitest";
import { generateCodeChallenge, generateCodeVerifier } from "./pkce";

describe("pkce utils", () => {
	it("gera code verifier base64url", async () => {
		const verifier = await generateCodeVerifier();

		expect(verifier.length).toBeGreaterThan(20);
		expect(verifier).toMatch(/^[A-Za-z0-9\-_]+$/);
	});

	it("gera code challenge esperado para verifier conhecido (RFC 7636)", async () => {
		const verifier = "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk";
		const challenge = await generateCodeChallenge(verifier);

		expect(challenge).toBe("E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM");
	});
});
