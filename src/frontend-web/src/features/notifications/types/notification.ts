export type Notification = {
	id: number;
	user_id: number;
	type: string | null;
	message: string | null;
	is_read: boolean;
	reservation_id: number | null;
	occurrence_id: number | null;
	delivery_id: number | null;
	created_at?: string | null;
	updated_at?: string | null;
};

export type NotificationUser = {
	id: number;
	username: string | null;
	email: string | null;
	profile: string | null;
};

export type NotificationForm = {
	userId: string;
	type: string;
	message: string;
	reservationId: string;
	occurrenceId: string;
	deliveryId: string;
};

export type NotificationStatusFilter = "all" | "unread" | "read";

export type NotificationStats = {
	total: number;
	unread: number;
	read: number;
	delivery: number;
	reservation: number;
};
