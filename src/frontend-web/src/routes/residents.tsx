import { ResidentsPage } from "#/features/residents/ResidentsPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/residents")({
	component: ResidentsPage,
});
