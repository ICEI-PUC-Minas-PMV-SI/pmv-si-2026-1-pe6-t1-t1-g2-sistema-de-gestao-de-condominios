import type { Notification, NotificationUser } from "../types/notification";

export function getNotificationTypeClasses(type: string | null) {
	const normalized = type?.toLowerCase() ?? "";

	if (normalized.includes("encomenda")) {
		return "bg-blue-50 text-blue-700";
	}

	if (normalized.includes("cancelada")) {
		return "bg-rose-50 text-rose-700";
	}

	if (normalized.includes("reserva")) {
		return "bg-emerald-50 text-emerald-700";
	}

	return "bg-slate-100 text-slate-600";
}

export function getNotificationIcon(type: string | null) {
	const normalized = type?.toLowerCase() ?? "";

	if (normalized.includes("encomenda")) return "package_2";
	if (normalized.includes("cancelada")) return "event_busy";
	if (normalized.includes("reserva")) return "event_available";

	return "notifications";
}

export function getUserLabel(user?: NotificationUser, fallbackId?: number | null) {
	return user?.username || user?.email || (fallbackId ? `ID ${fallbackId}` : "-");
}

export function formatRelatedRecord(notification: Notification) {
	if (notification.delivery_id) return `Encomenda #${notification.delivery_id}`;
	if (notification.reservation_id) return `Reserva #${notification.reservation_id}`;
	if (notification.occurrence_id) return `Ocorrencia #${notification.occurrence_id}`;

	return "Sem vinculo";
}

export function formatNotificationDate(value?: string | null) {
	if (!value) return "Data indisponivel";

	return new Date(value).toLocaleString("pt-BR");
}
