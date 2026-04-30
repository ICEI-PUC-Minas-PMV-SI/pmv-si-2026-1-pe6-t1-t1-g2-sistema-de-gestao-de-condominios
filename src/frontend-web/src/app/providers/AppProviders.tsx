import { QueryClientProvider } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import type { ReactNode } from "react";

type AppProvidersProps = {
	children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
	const router = useRouter();
	const queryClient = router.options.context.queryClient;

	return (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	);
}
