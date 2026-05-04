import { apiRequest } from "#/services/api-client";
import { getAuthToken } from "#/services/auth-service";
import type { EditResidentForm, ResidentApiUser } from "../types/resident";

function getAuthHeaders(): HeadersInit {
	const token = getAuthToken();
	return token ? { Authorization: `Bearer ${token}` } : {};
}

export function fetchResidents() {
	return apiRequest<ResidentApiUser[]>("/api/Users", {
		headers: getAuthHeaders(),
	});
}

export function createResident(payload: {
	username: string;
	email: string;
	password: string;
}) {
	return apiRequest<ResidentApiUser>("/api/Users", {
		method: "POST",
		headers: getAuthHeaders(),
		body: JSON.stringify({
			username: payload.username,
			email: payload.email,
			password_hash: payload.password,
			profile: "Morador",
		}),
	});
}

export function updateResident(id: number, payload: EditResidentForm) {
	return apiRequest<ResidentApiUser>(`/api/Users/${id}`, {
		method: "PUT",
		headers: getAuthHeaders(),
		body: JSON.stringify({
			username: payload.username,
			email: payload.email,
			profile: payload.profile,
		}),
	});
}

export function deleteResident(id: number) {
	return apiRequest<void>(`/api/Users/${id}`, {
		method: "DELETE",
		headers: getAuthHeaders(),
	});
}
