import { apiRequest } from "#/services/api-client";
import { getAuthToken } from "#/services/auth-service";
import type { CreateOccurrenceForm, OccurrenceApiRecord } from "../types/occurrence";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

function getAuthHeaders(): HeadersInit {
    const token = getAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
}

export function fetchMyOccurrences() {
    return apiRequest<OccurrenceApiRecord[]>("/api/Occurrences/meu", {
        headers: getAuthHeaders(),
    });
}

export function createOccurrence(payload: CreateOccurrenceForm) {
    return apiRequest<OccurrenceApiRecord>("/api/Occurrences", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
            title: payload.title,
            description: payload.description,
        }),
    });
}
