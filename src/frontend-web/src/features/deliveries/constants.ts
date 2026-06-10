import type { DeliveryForm, FilterForm } from "./types/delivery";

export const DEFAULT_DELIVERY_STATUS = "Registrada";

export const PICKED_UP_DELIVERY_STATUS = "Retirada";

export const DELIVERY_STATUS_OPTIONS = [
  DEFAULT_DELIVERY_STATUS,
  "Disponível para Retirada",
  PICKED_UP_DELIVERY_STATUS,
] as const;

const today = new Date().toISOString().split("T")[0];
const now = new Date().toTimeString().slice(0, 5);

export const EMPTY_DELIVERY_FORM: DeliveryForm = {
  recipientUserId: "",
  description: "",
  status: DEFAULT_DELIVERY_STATUS,
  arrivalDate: today,
  arrivalTime: now,
};

export const EMPTY_FILTER_FORM: FilterForm = {
  status: "",
  arrivalDateFrom: "",
  arrivalDateTo: "",
  recipient: "",
};
