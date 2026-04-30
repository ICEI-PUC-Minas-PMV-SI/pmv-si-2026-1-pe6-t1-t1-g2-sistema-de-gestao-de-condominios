import { QueryClient } from "@tanstack/react-query";

export type RouterContext = {
	queryClient: QueryClient;
};

export function createRouterContext(): RouterContext {
	return {
		queryClient: new QueryClient(),
	};
}
