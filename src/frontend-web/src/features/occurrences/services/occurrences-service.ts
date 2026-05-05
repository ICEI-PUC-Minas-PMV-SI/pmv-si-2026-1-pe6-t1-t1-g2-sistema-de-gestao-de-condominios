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

export function uploadOccurrenceImage(occurrenceId: number, file: File) {
    const formData = new FormData();
    formData.append("file", file);

    return apiRequest<any>(`/api/Occurrences/${occurrenceId}/images`, {
        method: "POST",
        headers: getAuthHeaders(), // O api-client deve lidar com o Content-Type automaticamente para FormData
        body: formData,
    });
}
