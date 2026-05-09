import type { NotificationForm } from "./types/notification";

export const NOTIFICATION_TYPES = [
	"Encomenda Chegou",
	"Reserva Confirmada",
	"Reserva Cancelada",
] as const;

export const EMPTY_NOTIFICATION_FORM: NotificationForm = {
	userId: "",
	type: NOTIFICATION_TYPES[0],
	message: "",
	reservationId: "",
	occurrenceId: "",
	deliveryId: "",
};
