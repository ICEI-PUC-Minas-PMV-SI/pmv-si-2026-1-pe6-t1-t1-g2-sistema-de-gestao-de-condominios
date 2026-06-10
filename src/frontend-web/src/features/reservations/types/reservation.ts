export type ReservationStatus = "Pendente" | "Aprovada" | "Cancelada";

export type ReservationApiRecord = {
  id?: number;
  Id?: number;
  common_area_id?: number;
  CommonAreaId?: number;
  areaComumId?: number;
  AreaComumId?: number;
  user_id?: number;
  UserId?: number;
  moradorId?: number;
  MoradorId?: number;
  start_time?: string;
  StartTime?: string;
  dataHoraInicio?: string;
  DataHoraInicio?: string;
  end_time?: string;
  EndTime?: string;
  dataHoraFim?: string;
  DataHoraFim?: string;
  status?: ReservationStatus;
  Status?: ReservationStatus;
  createdAt?: string | null;
  CreatedAt?: string | null;
  updatedAt?: string | null;
  UpdatedAt?: string | null;
};

export type Reservation = {
  id: number;
  areaComumId: number;
  moradorId: number;
  dataHoraInicio: string;
  dataHoraFim: string;
  status: ReservationStatus;
  createdAt: string | null;
  updatedAt: string | null;
};

export type ReservationForm = {
  areaComumId: string;
  dataInicio: string;
  horaInicio: string;
  dataFim: string;
  horaFim: string;
  status: ReservationStatus;
};

export type ReservationDraft = {
  areaComumId: string;
  selectedDate: string;
  startHour: number | null;
  endHour: number | null;
  status: ReservationStatus;
};
