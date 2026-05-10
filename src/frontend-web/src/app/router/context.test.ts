import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import { createRouterContext } from "./context";

describe("createRouterContext", () => {
	it("cria context com QueryClient", () => {
		const context = createRouterContext();
		expect(context.queryClient).toBeInstanceOf(QueryClient);
	});
});
