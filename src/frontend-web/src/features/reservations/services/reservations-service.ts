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
    areaComumId: Number(
      record.common_area_id ?? record.CommonAreaId ?? record.areaComumId ?? record.AreaComumId ?? 0,
    ),
    moradorId: Number(
      record.user_id ?? record.UserId ?? record.moradorId ?? record.MoradorId ?? 0,
    ),
    dataHoraInicio: String(
      record.start_time ?? record.StartTime ?? record.dataHoraInicio ?? record.DataHoraInicio ?? "",
    ),
    dataHoraFim: String(
      record.end_time ?? record.EndTime ?? record.dataHoraFim ?? record.DataHoraFim ?? "",
    ),
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
      common_area_id: Number(payload.areaComumId),
      user_id: moradorId,
      start_time: new Date(`${payload.dataInicio}T${payload.horaInicio}`).toISOString(),
      end_time: new Date(`${payload.dataFim}T${payload.horaFim}`).toISOString(),
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
      common_area_id: payload.areaComumId,
      user_id: payload.moradorId,
      start_time: new Date(payload.dataHoraInicio).toISOString(),
      end_time: new Date(payload.dataHoraFim).toISOString(),
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
