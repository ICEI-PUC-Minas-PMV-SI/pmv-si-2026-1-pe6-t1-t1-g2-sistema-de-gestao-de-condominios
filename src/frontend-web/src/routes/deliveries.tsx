import { createFileRoute } from "@tanstack/react-router";
import { DeliveriesPage } from "#/features/deliveries/DeliveriesPage";

export const Route = createFileRoute("/deliveries")({
	component: DeliveriesPage,
});
