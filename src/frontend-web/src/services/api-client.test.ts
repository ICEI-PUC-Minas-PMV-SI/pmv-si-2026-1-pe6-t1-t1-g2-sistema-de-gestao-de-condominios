import { describe, expect, it, vi } from "vitest";
import { apiRequest } from "./api-client";

describe("apiRequest", () => {
	it("envia Content-Type JSON por padrão e retorna payload", async () => {
		const fetchMock = vi.fn().mockResolvedValue(
			new Response(JSON.stringify({ ok: true }), {
				status: 200,
				headers: { "content-type": "application/json" },
			}),
		);
		vi.stubGlobal("fetch", fetchMock);

		const result = await apiRequest<{ ok: boolean }>("/health");

		expect(result).toEqual({ ok: true });
		expect(fetchMock).toHaveBeenCalledTimes(1);
		const [, options] = fetchMock.mock.calls[0] as [string, RequestInit];
		expect(new Headers(options.headers).get("Content-Type")).toBe(
			"application/json",
		);
	});

	it("não força Content-Type quando body é FormData", async () => {
		const fetchMock = vi.fn().mockResolvedValue(
			new Response(JSON.stringify({ ok: true }), {
				status: 200,
				headers: { "content-type": "application/json" },
			}),
		);
		vi.stubGlobal("fetch", fetchMock);

		const body = new FormData();
		body.append("file", new Blob(["x"]), "a.txt");

		await apiRequest("/upload", { method: "POST", body });

		const [, options] = fetchMock.mock.calls[0] as [string, RequestInit];
		expect(new Headers(options.headers).has("Content-Type")).toBe(false);
	});

	it("retorna undefined para 204", async () => {
		const fetchMock = vi
			.fn()
			.mockResolvedValue(new Response(null, { status: 204 }));
		vi.stubGlobal("fetch", fetchMock);

		const result = await apiRequest<void>("/resource", { method: "DELETE" });

		expect(result).toBeUndefined();
	});

	it("propaga primeiro erro de validação do backend", async () => {
		const fetchMock = vi.fn().mockResolvedValue(
			new Response(
				JSON.stringify({
					errors: { email: ["E-mail inválido"] },
				}),
				{
					status: 400,
					headers: { "content-type": "application/json" },
				},
			),
		);
		vi.stubGlobal("fetch", fetchMock);

		await expect(apiRequest("/users")).rejects.toThrow("E-mail inválido");
	});

	it("usa texto do response quando erro não é JSON", async () => {
		const fetchMock = vi
			.fn()
			.mockResolvedValue(new Response("Falha externa", { status: 502 }));
		vi.stubGlobal("fetch", fetchMock);

		await expect(apiRequest("/proxy")).rejects.toThrow("Falha externa");
	});
});
