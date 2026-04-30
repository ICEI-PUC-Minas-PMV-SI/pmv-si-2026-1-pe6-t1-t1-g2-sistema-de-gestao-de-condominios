import type { DeliveryForm, FilterForm } from "./types/delivery";

export const DEFAULT_DELIVERY_STATUS = "Disponível para Retirada";

export const DELIVERY_STATUS_OPTIONS = [
	DEFAULT_DELIVERY_STATUS,
	"Entregue",
] as const;

export const EMPTY_DELIVERY_FORM: DeliveryForm = {
	recipientUserId: "",
	description: "",
	status: DEFAULT_DELIVERY_STATUS,
};

export const EMPTY_FILTER_FORM: FilterForm = {
	status: "",
	arrivalDateFrom: "",
	arrivalDateTo: "",
	recipient: "",
};
