import { render, screen } from "@testing-library/react";
import { QueryClient, useQueryClient } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";
import { AppProviders } from "./AppProviders";

const queryClient = new QueryClient();

vi.mock("@tanstack/react-router", async () => {
	const actual = await vi.importActual<typeof import("@tanstack/react-router")>(
		"@tanstack/react-router",
	);
	return {
		...actual,
		useRouter: () => ({
			options: {
				context: { queryClient },
			},
		}),
	};
});

function Probe() {
	const client = useQueryClient();
	return <span>{client === queryClient ? "ok" : "fail"}</span>;
}

describe("AppProviders", () => {
	it("injeta QueryClient do contexto do router", () => {
		render(
			<AppProviders>
				<Probe />
			</AppProviders>,
		);

		expect(screen.getByText("ok")).toBeTruthy();
	});
});
