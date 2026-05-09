import { apiRequest } from "#/services/api-client";
import { getAuthToken } from "#/services/auth-service";
import type { Delivery, DeliveryUser } from "../types/delivery";

function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function fetchDeliveries(recipientUserId?: number) {
  const params = recipientUserId ? `?recipientUserId=${recipientUserId}` : "";
  return apiRequest<Delivery[]>(`/api/Deliveries${params}`, {
    headers: getAuthHeaders(),
  });
}

export function fetchDeliveryUsers() {
  return apiRequest<DeliveryUser[]>("/api/Users", {
    headers: getAuthHeaders(),
  });
}

export function createDelivery(payload: {
  recipient_user_id: number | null;
  registered_by_user_id?: number | null;
  description: string;
  arrival_date: string;
  pickup_date: string | null;
  status: string;
}) {
  return apiRequest<Delivery>("/api/Deliveries", {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
}

export function deleteDelivery(id: number) {
  return apiRequest<void>(`/api/Deliveries/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
}

export function updateDelivery(
  id: number,
  payload: {
    recipient_user_id: number | null;
    registered_by_user_id?: number | null;
    description: string;
    arrival_date?: string;
    pickup_date?: string | null;
    status: string;
  },
) {
  return apiRequest<Delivery>(`/api/Deliveries/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
}