import { apiRequest } from "#/services/api-client";
import { getAuthToken } from "#/services/auth-service";
import type { CreateOccurrenceForm, OccurrenceApiRecord } from "../types/occurrence";

// Não precisamos da BASE_URL aqui se o api-client já a utiliza internamente, 
// mas mantemos se você a usa para outros fins.
// const BASE_URL = import.meta.env.VITE_BACKEND_URL;

function getAuthHeaders(): HeadersInit {
    const token = getAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
}

export function fetchMyOccurrences() {
    return apiRequest<OccurrenceApiRecord[]>("/api/Occurrences/meu", {
        headers: getAuthHeaders(),
    });
}

export function fetchAllOccurrences() {
    return apiRequest<OccurrenceApiRecord[]>("/api/Occurrences", {
        headers: getAuthHeaders(),
    });
}

export function createOccurrence(payload: CreateOccurrenceForm) {
    return apiRequest<OccurrenceApiRecord>("/api/Occurrences", {
        method: "POST",
        headers: {
            ...getAuthHeaders(),
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            title: payload.title,
            description: payload.description,
        }),
    });
}

export function uploadOccurrenceImage(occurrenceId: number, file: File) {
    const formData = new FormData();
    // O nome "file" deve ser IDÊNTICO ao parâmetro no seu Controller C# [FromForm] IFormFile file
    formData.append("file", file);

    return apiRequest<any>(`/api/Occurrences/${occurrenceId}/images`, {
        method: "POST",
        headers: {
            ...getAuthHeaders(),
            // ATENÇÃO: NÃO coloque "Content-Type" aqui. 
            // O navegador vai identificar o FormData e colocar o Content-Type correto com o boundary.
        },
        body: formData,
    });
}

export function updateOccurrence(id: number, payload: CreateOccurrenceForm) {
    return apiRequest<OccurrenceApiRecord>(`/api/Occurrences/${id}`, {
        method: "PUT",
        headers: {
            ...getAuthHeaders(),
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });
}

export function deleteOccurrence(id: number) {
    return apiRequest<void>(`/api/Occurrences/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
    });
}