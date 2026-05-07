import { apiRequest } from "#/services/api-client";
import { getAuthToken } from "#/services/auth-service";
import type {
  Reservation,
  ReservationApiRecord,
  ReservationForm,
} from "../types/reservation";

function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function mapReservation(record: ReservationApiRecord): Reservation {
  return {
    id: Number(record.id ?? record.Id ?? 0),
    areaComumId: Number(record.areaComumId ?? record.AreaComumId ?? 0),
    moradorId: Number(record.moradorId ?? record.MoradorId ?? 0),
    dataHoraInicio: String(record.dataHoraInicio ?? record.DataHoraInicio ?? ""),
    dataHoraFim: String(record.dataHoraFim ?? record.DataHoraFim ?? ""),
    status: (record.status ?? record.Status ?? "Pendente") as Reservation["status"],
    createdAt: (record.createdAt ?? record.CreatedAt ?? null) as string | null,
    updatedAt: (record.updatedAt ?? record.UpdatedAt ?? null) as string | null,
  };
}

export async function fetchReservations() {
  const response = await apiRequest<ReservationApiRecord[]>("/api/reservas", {
    headers: getAuthHeaders(),
  });
  return response.map(mapReservation);
}

export async function createReservation(
  payload: ReservationForm,
  moradorId: number,
) {
  const response = await apiRequest<ReservationApiRecord>("/api/reservas", {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      areaComumId: Number(payload.areaComumId),
      moradorId,
      dataHoraInicio: new Date(payload.dataHoraInicio).toISOString(),
      dataHoraFim: new Date(payload.dataHoraFim).toISOString(),
      status: payload.status,
    }),
  });

  return mapReservation(response);
}

export async function updateReservation(id: number, payload: Reservation) {
  const response = await apiRequest<ReservationApiRecord>(`/api/reservas/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      id,
      areaComumId: payload.areaComumId,
      moradorId: payload.moradorId,
      dataHoraInicio: new Date(payload.dataHoraInicio).toISOString(),
      dataHoraFim: new Date(payload.dataHoraFim).toISOString(),
      status: payload.status,
    }),
  });

  return mapReservation(response);
}

export function deleteReservation(id: number) {
  return apiRequest<void>(`/api/reservas/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
}
