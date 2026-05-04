import type { Delivery, DeliveryUser } from "../types/delivery";

export function isToday(dateValue?: string | null) {
	if (!dateValue) return false;

	const date = new Date(dateValue);
	const today = new Date();

	return date.toDateString() === today.toDateString();
}

export function isWaitingPickup(status?: string | null) {
	const normalizedStatus = status?.toLowerCase() ?? "";

	return (
		normalizedStatus.includes("disponível") ||
		normalizedStatus.includes("disponivel") ||
		normalizedStatus.includes("retirada")
	);
}

export function isPickedUp(delivery: Delivery) {
	const normalizedStatus = delivery.status?.toLowerCase() ?? "";

	return (
		Boolean(delivery.pickup_date) ||
		normalizedStatus.includes("entregue") ||
		normalizedStatus.includes("retirad")
	);
}

export function formatDateTime(dateValue?: string | null) {
	if (!dateValue) return "-";

	return new Date(dateValue).toLocaleString("pt-BR");
}

export function getUserLabel(
	user?: Pick<DeliveryUser, "username" | "email"> | null,
	fallbackId?: number | null,
) {
	return (
		user?.username || user?.email || (fallbackId ? `ID ${fallbackId}` : "-")
	);
}

export function getDeliveryUserLabel(
	username?: string | null,
	email?: string | null,
	fallbackId?: number | null,
) {
	return username || email || (fallbackId ? `ID ${fallbackId}` : "-");
}

export function getStatusClasses(status?: string | null) {
	if (isWaitingPickup(status)) {
		return "bg-amber-50 text-amber-600";
	}

	if ((status ?? "").toLowerCase().includes("entreg")) {
		return "bg-emerald-50 text-emerald-600";
	}

	return "bg-slate-100 text-slate-600";
}
