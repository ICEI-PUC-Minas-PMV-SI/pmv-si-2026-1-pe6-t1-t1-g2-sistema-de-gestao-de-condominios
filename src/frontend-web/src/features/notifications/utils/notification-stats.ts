import type { Notification, NotificationStats } from "../types/notification";

export function calculateNotificationStats(
	notifications: Notification[],
): NotificationStats {
	return {
		total: notifications.length,
		unread: notifications.filter((notification) => !notification.is_read).length,
		read: notifications.filter((notification) => notification.is_read).length,
		delivery: notifications.filter((notification) => notification.delivery_id)
			.length,
		reservation: notifications.filter((notification) => notification.reservation_id)
			.length,
	};
}
