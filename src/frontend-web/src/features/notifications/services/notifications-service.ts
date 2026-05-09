import { apiRequest } from "#/services/api-client";
import { getAuthToken } from "#/services/auth-service";
import type { Notification, NotificationUser } from "../types/notification";

function getAuthHeaders(): HeadersInit {
	const token = getAuthToken();
	return token ? { Authorization: `Bearer ${token}` } : {};
}

export function fetchNotifications(userId?: number) {
	const params = userId ? `?userId=${userId}` : "";

	return apiRequest<Notification[]>(`/api/Notifications${params}`, {
		headers: getAuthHeaders(),
	});
}

export function fetchNotificationUsers() {
	return apiRequest<NotificationUser[]>("/api/Users", {
		headers: getAuthHeaders(),
	});
}

export function createNotification(payload: {
	user_id: number;
	type: string;
	message: string;
	is_read: boolean;
	reservation_id: number | null;
	occurrence_id: number | null;
	delivery_id: number | null;
}) {
	return apiRequest<Notification>("/api/Notifications", {
		method: "POST",
		headers: getAuthHeaders(),
		body: JSON.stringify(payload),
	});
}

export function deleteNotification(id: number) {
	return apiRequest<void>(`/api/Notifications/${id}`, {
		method: "DELETE",
		headers: getAuthHeaders(),
	});
}

export function updateNotificationReadStatus(id: number, isRead: boolean) {
	return apiRequest<Notification>(`/api/Notifications/${id}/read-status`, {
		method: "PATCH",
		headers: getAuthHeaders(),
		body: JSON.stringify({ isRead }),
	});
}
