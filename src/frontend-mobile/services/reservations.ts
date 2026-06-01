import { apiRequest } from "@/services/auth";
import { getAuthToken } from "@/services/authSession";

type CommonAreaApiRecord = {
  id?: number;
  Id?: number;
  name?: string;
  Name?: string;
  capacity?: number;
  Capacity?: number;
};

type BusySlotApiRecord = {
  inicio?: string;
  fim?: string;
  Inicio?: string;
  Fim?: string;
};

type ReservationApiRecord = {
  id?: number;
  Id?: number;
  common_area_id?: number;
  CommonAreaId?: number;
  user_id?: number;
  UserId?: number;
  start_time?: string;
  StartTime?: string;
  end_time?: string;
  EndTime?: string;
  status?: string;
  Status?: string;
};

export type CommonArea = {
  id: number;
  name: string;
  capacity: number;
};

export type BusySlot = {
  start: Date;
  end: Date;
};

export type CreateReservationInput = {
  areaId: number;
  userId: number;
  startIso: string;
  endIso: string;
  status?: "Pendente" | "Aprovada" | "Rejeitada" | "Cancelada";
};

export type Reservation = {
  id: number;
  areaId: number;
  userId: number;
  startIso: string;
  endIso: string;
  status: string;
};

function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function mapCommonArea(record: CommonAreaApiRecord): CommonArea {
  return {
    id: Number(record.id ?? record.Id ?? 0),
    name: String(record.name ?? record.Name ?? "Área comum"),
    capacity: Number(record.capacity ?? record.Capacity ?? 0),
  };
}

function mapReservation(record: ReservationApiRecord): Reservation {
  return {
    id: Number(record.id ?? record.Id ?? 0),
    areaId: Number(record.common_area_id ?? record.CommonAreaId ?? 0),
    userId: Number(record.user_id ?? record.UserId ?? 0),
    startIso: String(record.start_time ?? record.StartTime ?? ""),
    endIso: String(record.end_time ?? record.EndTime ?? ""),
    status: String(record.status ?? record.Status ?? "Pendente"),
  };
}

export async function fetchCommonAreas() {
  const response = await apiRequest<CommonAreaApiRecord[]>("/api/areas-comuns", {
    method: "GET",
    headers: getAuthHeaders(),
  });

  return response.map(mapCommonArea).filter((area) => area.id > 0);
}

export async function fetchBusySlots(areaId: number, dateIso: string) {
  const query = new URLSearchParams({
    areaId: String(areaId),
    data: dateIso,
  });

  const response = await apiRequest<BusySlotApiRecord[]>(
    `/api/reservas/disponibilidade?${query.toString()}`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    },
  );

  return response
    .map((slot) => {
      const start = new Date(slot.inicio ?? slot.Inicio ?? "");
      const end = new Date(slot.fim ?? slot.Fim ?? "");
      return { start, end };
    })
    .filter((slot) => !Number.isNaN(slot.start.getTime()) && !Number.isNaN(slot.end.getTime()));
}

export async function createReservation(input: CreateReservationInput) {
  const response = await apiRequest<ReservationApiRecord>("/api/reservas", {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      common_area_id: input.areaId,
      user_id: input.userId,
      start_time: input.startIso,
      end_time: input.endIso,
      status: input.status ?? "Pendente",
    }),
  });

  return mapReservation(response);
}
