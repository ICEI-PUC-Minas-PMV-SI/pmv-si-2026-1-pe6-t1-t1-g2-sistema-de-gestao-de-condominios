import { getRouter } from "./app/router/router";

export { getRouter };

declare module "@tanstack/react-router" {
	interface Register {
		router: ReturnType<typeof getRouter>;
	}
}
