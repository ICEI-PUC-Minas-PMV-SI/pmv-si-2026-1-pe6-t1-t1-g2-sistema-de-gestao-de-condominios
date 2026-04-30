import { EMPTY_FILTER_FORM } from "../constants";
import type { ActiveFilter, Delivery, FilterForm } from "../types/delivery";
import { getDeliveryUserLabel } from "./delivery-formatters";

export function filterDeliveries(
	deliveries: Delivery[],
	searchTerm: string,
	activeFilters: ActiveFilter[],
) {
	let result = deliveries;
	const normalizedSearchTerm = searchTerm.trim().toLowerCase();

	if (normalizedSearchTerm) {
		result = result.filter((delivery) => {
			const searchable = [
				delivery.id,
				delivery.description,
				delivery.status,
				getDeliveryUserLabel(
					delivery.recipient_username,
					delivery.recipient_email,
					delivery.recipient_user_id,
				),
				getDeliveryUserLabel(
					delivery.registered_by_username,
					delivery.registered_by_email,
					delivery.registered_by_user_id,
				),
			]
				.filter(Boolean)
				.join(" ")
				.toLowerCase();

			return searchable.includes(normalizedSearchTerm);
		});
	}

	for (const filter of activeFilters) {
		if (filter.field === "status") {
			result = result.filter((delivery) => delivery.status === filter.value);
		}

		if (filter.field === "arrival_date_from") {
			result = result.filter(
				(delivery) => delivery.arrival_date >= filter.value,
			);
		}

		if (filter.field === "arrival_date_to") {
			result = result.filter(
				(delivery) => delivery.arrival_date <= `${filter.value}T23:59:59`,
			);
		}

		if (filter.field === "recipient") {
			const value = filter.value.toLowerCase();
			result = result.filter(
				(delivery) =>
					(delivery.recipient_username ?? "").toLowerCase().includes(value) ||
					(delivery.recipient_email ?? "").toLowerCase().includes(value),
			);
		}
	}

	return result;
}

export function getFilterFormFromActiveFilters(activeFilters: ActiveFilter[]) {
	const filterForm: FilterForm = { ...EMPTY_FILTER_FORM };

	for (const filter of activeFilters) {
		if (filter.field === "status") filterForm.status = filter.value;
		if (filter.field === "arrival_date_from") {
			filterForm.arrivalDateFrom = filter.value;
		}
		if (filter.field === "arrival_date_to") {
			filterForm.arrivalDateTo = filter.value;
		}
		if (filter.field === "recipient") filterForm.recipient = filter.value;
	}

	return filterForm;
}

export function buildActiveFilters(filterForm: FilterForm) {
	const nextFilters: ActiveFilter[] = [];

	if (filterForm.status) {
		nextFilters.push({
			id: "status",
			label: `Status: ${filterForm.status}`,
			field: "status",
			value: filterForm.status,
		});
	}

	if (filterForm.arrivalDateFrom) {
		nextFilters.push({
			id: "arrival_date_from",
			label: `A partir de: ${filterForm.arrivalDateFrom}`,
			field: "arrival_date_from",
			value: filterForm.arrivalDateFrom,
		});
	}

	if (filterForm.arrivalDateTo) {
		nextFilters.push({
			id: "arrival_date_to",
			label: `Até: ${filterForm.arrivalDateTo}`,
			field: "arrival_date_to",
			value: filterForm.arrivalDateTo,
		});
	}

	const recipient = filterForm.recipient.trim();
	if (recipient) {
		nextFilters.push({
			id: "recipient",
			label: `Destinatário: ${recipient}`,
			field: "recipient",
			value: recipient,
		});
	}

	return nextFilters;
}
