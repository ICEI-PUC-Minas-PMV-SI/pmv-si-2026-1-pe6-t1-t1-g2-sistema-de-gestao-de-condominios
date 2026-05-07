export type ReservationStatus = "Pendente" | "Aprovada" | "Cancelada";

export type ReservationApiRecord = {
  id?: number;
  Id?: number;
  areaComumId?: number;
  AreaComumId?: number;
  moradorId?: number;
  MoradorId?: number;
  dataHoraInicio?: string;
  DataHoraInicio?: string;
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
  dataHoraInicio: string;
  dataHoraFim: string;
  status: ReservationStatus;
};
