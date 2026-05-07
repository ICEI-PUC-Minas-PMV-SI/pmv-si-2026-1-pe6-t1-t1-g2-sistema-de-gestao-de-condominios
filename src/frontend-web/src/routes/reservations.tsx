import { createFileRoute } from "@tanstack/react-router";
import { ReservationsPage } from "#/features/reservations/ReservationsPage";

export const Route = createFileRoute("/reservations")({
  component: ReservationsPage,
});
