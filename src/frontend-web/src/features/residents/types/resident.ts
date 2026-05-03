export type ResidentStatus = "Ativo" | "Inativo";

export type ResidentApiUser = {
	id: number;
	username: string | null;
	email: string | null;
	profile: string | null;
};

export type ResidentForm = {
	name: string;
	email: string;
	password: string;
};

export type EditResidentForm = {
	username: string;
	email: string;
	profile: string;
};

export type Resident = {
	id: number;
	name: string;
	memberSince: string;
	unit: string;
	phone: string;
	email: string;
	status: ResidentStatus;
	profile?: string;
};

export type ResidentStats = {
	totalResidents: number;
	newThisMonth: number;
	pendingRequests: number;
	totalCapacity: number;
};

export type ResidentFilter =
	| "all"
	| "admins"
	| "residents"
	| "active"
	| "inactive";

export type ResidentPagination = {
	currentPage: number;
	totalPages: number;
};
