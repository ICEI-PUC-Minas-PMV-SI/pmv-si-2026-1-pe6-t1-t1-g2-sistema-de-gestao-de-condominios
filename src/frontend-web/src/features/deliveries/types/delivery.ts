export type Delivery = {
	id: number;
	recipient_user_id: number | null;
	recipient_username: string | null;
	recipient_email: string | null;
	registered_by_user_id: number | null;
	registered_by_username: string | null;
	registered_by_email: string | null;
	description: string | null;
	arrival_date: string;
	pickup_date: string | null;
	status: string | null;
};

export type DeliveryUser = {
	id: number;
	username: string | null;
	email: string | null;
	profile: string | null;
};

export type DeliveryForm = {
	recipientUserId: string;
	description: string;
	status: string;
};

export type ActiveFilter = {
	id: string;
	label: string;
	field: "status" | "arrival_date_from" | "arrival_date_to" | "recipient";
	value: string;
};

export type FilterForm = {
	status: string;
	arrivalDateFrom: string;
	arrivalDateTo: string;
	recipient: string;
};

export type DeliveryStats = {
	receivedToday: number;
	waitingPickup: number;
	pickedUpToday: number;
	inStorage: number;
};
