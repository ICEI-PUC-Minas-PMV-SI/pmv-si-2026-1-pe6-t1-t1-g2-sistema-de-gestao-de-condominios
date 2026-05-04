import type { ResidentStatus } from "../types/resident";

export function formatNumber(value: number) {
	return value.toLocaleString("pt-BR");
}

export function formatPercentage(value: number) {
	return `${value}%`;
}

export function getStatusClasses(status: ResidentStatus) {
	if (status === "Ativo") {
		return "bg-emerald-100 text-emerald-700";
	}

	return "bg-slate-100 text-slate-600";
}

export function getStatusDotClass(status: ResidentStatus) {
	if (status === "Ativo") {
		return "bg-emerald-500";
	}

	return "bg-slate-400";
}
