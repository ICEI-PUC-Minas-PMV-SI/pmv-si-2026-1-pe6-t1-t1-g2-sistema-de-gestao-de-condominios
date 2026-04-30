import { createFileRoute } from "@tanstack/react-router";
import { RegisterPage } from "#/pages/auth/RegisterPage";

export const Route = createFileRoute("/")({
	component: RegisterPage,
});
