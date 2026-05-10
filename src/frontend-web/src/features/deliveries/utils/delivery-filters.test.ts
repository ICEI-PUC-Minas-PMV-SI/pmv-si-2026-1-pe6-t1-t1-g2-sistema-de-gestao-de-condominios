import { describe, expect, it } from "vitest";
import type { ActiveFilter, Delivery, FilterForm } from "../types/delivery";
import {
	buildActiveFilters,
	filterDeliveries,
	getFilterFormFromActiveFilters,
} from "./delivery-filters";

const baseDeliveries: Delivery[] = [
	{
		id: 1,
		description: "Pacote A",
		status: "Registrada",
		arrival_date: "2026-05-09T09:00:00",
		pickup_date: null,
		recipient_user_id: 10,
		recipient_username: "Joao",
		recipient_email: "joao@x.com",
		registered_by_user_id: 2,
		registered_by_username: "Admin",
		registered_by_email: "admin@x.com",
	},
	{
		id: 2,
		description: "Pacote B",
		status: "Disponível para Retirada",
		arrival_date: "2026-05-10T09:00:00",
		pickup_date: null,
		recipient_user_id: 11,
		recipient_username: "Maria",
		recipient_email: "maria@x.com",
		registered_by_user_id: 2,
		registered_by_username: "Admin",
		registered_by_email: "admin@x.com",
	},
];

describe("delivery-filters", () => {
	it("filtra por termo de busca em múltiplos campos", () => {
		const result = filterDeliveries(baseDeliveries, "maria", []);
		expect(result).toHaveLength(1);
		expect(result[0].id).toBe(2);
	});

	it("aplica filtros ativos por status, data e destinatário", () => {
		const filters: ActiveFilter[] = [
			{
				id: "status",
				label: "Status",
				field: "status",
				value: "Disponível para Retirada",
			},
			{
				id: "arrival_date_from",
				label: "Inicio",
				field: "arrival_date_from",
				value: "2026-05-10",
			},
			{
				id: "recipient",
				label: "Dest",
				field: "recipient",
				value: "maria",
			},
		];

		const result = filterDeliveries(baseDeliveries, "", filters);
		expect(result).toHaveLength(1);
		expect(result[0].id).toBe(2);
	});

	it("converte filtros ativos em formulário", () => {
		const filters: ActiveFilter[] = [
			{ id: "status", label: "", field: "status", value: "Registrada" },
			{
				id: "arrival_date_to",
				label: "",
				field: "arrival_date_to",
				value: "2026-05-12",
			},
		];

		expect(getFilterFormFromActiveFilters(filters)).toEqual({
			status: "Registrada",
			arrivalDateFrom: "",
			arrivalDateTo: "2026-05-12",
			recipient: "",
		});
	});

	it("converte formulário em filtros ativos", () => {
		const form: FilterForm = {
			status: "Registrada",
			arrivalDateFrom: "2026-05-01",
			arrivalDateTo: "",
			recipient: "  Ana  ",
		};

		expect(buildActiveFilters(form)).toEqual([
			{
				id: "status",
				label: "Status: Registrada",
				field: "status",
				value: "Registrada",
			},
			{
				id: "arrival_date_from",
				label: "A partir de: 2026-05-01",
				field: "arrival_date_from",
				value: "2026-05-01",
			},
			{
				id: "recipient",
				label: "Destinatário: Ana",
				field: "recipient",
				value: "Ana",
			},
		]);
	});
});
