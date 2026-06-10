import type { Reservation, ReservationDraft, ReservationForm } from "../types/reservation";

export const ALL_HOURS = Array.from({ length: 24 }, (_, i) => i);

export const DAY_NAMES_SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
export const DAY_NAMES_LONG = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
];

export function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function getLocalTodayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export type CalendarDay = {
  iso: string;
  dayNum: number;
  dayName: string;
  monthLabel: string;
};

export function buildDaysArray(count = 30): CalendarDay[] {
  const days: CalendarDay[] = [];
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  for (let i = 0; i < count; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push({
      iso: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
      dayNum: d.getDate(),
      dayName: DAY_NAMES_SHORT[d.getDay()],
      monthLabel: d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", ""),
    });
  }

  return days;
}

export function getAvailableHours(selectedDate: string): number[] {
  if (selectedDate !== getLocalTodayISO()) return ALL_HOURS;
  const currentHour = new Date().getHours();
  return ALL_HOURS.filter((h) => h > currentHour);
}

export type OccupiedSlot = { inicio: string; fim: string };

export function getOccupiedHours(slots: OccupiedSlot[]): Set<number> {
  const occupied = new Set<number>();

  for (const slot of slots) {
    const start = new Date(slot.inicio);
    const end = new Date(slot.fim);

    for (
      let h = start.getHours();
      h < end.getHours() || (end.getMinutes() > 0 && h <= end.getHours());
      h++
    ) {
      if (h < 24) occupied.add(h);
    }
  }

  return occupied;
}

export function draftToForm(draft: ReservationDraft): ReservationForm {
  const { areaComumId, selectedDate, startHour, endHour, status } = draft;

  if (startHour === null || endHour === null) {
    return {
      areaComumId,
      dataInicio: selectedDate,
      horaInicio: "00:00",
      dataFim: selectedDate,
      horaFim: "00:00",
      status,
    };
  }

  const horaInicio = `${pad(startHour)}:00`;

  if (endHour >= 24) {
    const next = new Date(`${selectedDate}T00:00:00`);
    next.setDate(next.getDate() + 1);
    const dataFim = `${next.getFullYear()}-${pad(next.getMonth() + 1)}-${pad(next.getDate())}`;
    return { areaComumId, dataInicio: selectedDate, horaInicio, dataFim, horaFim: "00:00", status };
  }

  return {
    areaComumId,
    dataInicio: selectedDate,
    horaInicio,
    dataFim: selectedDate,
    horaFim: `${pad(endHour)}:00`,
    status,
  };
}

export type ApprovedReservationStats = {
  today: number;
  tomorrow: number;
  thisWeek: number;
};

export function calculateApprovedReservationStats(
  reservations: Reservation[],
): ApprovedReservationStats {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const weekEnd = new Date(today);
  weekEnd.setDate(today.getDate() + 7);

  const stats: ApprovedReservationStats = { today: 0, tomorrow: 0, thisWeek: 0 };

  for (const reservation of reservations) {
    if (reservation.status !== "Aprovada") continue;

    const start = new Date(reservation.dataHoraInicio);
    const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());

    if (startDay.getTime() === today.getTime()) stats.today += 1;
    if (startDay.getTime() === tomorrow.getTime()) stats.tomorrow += 1;
    if (startDay >= today && startDay < weekEnd) stats.thisWeek += 1;
  }

  return stats;
}

export function reservationToDraft(reservation: Reservation): ReservationDraft {
  const start = new Date(reservation.dataHoraInicio);
  const end = new Date(reservation.dataHoraFim);

  const selectedDate = `${start.getUTCFullYear()}-${pad(start.getUTCMonth() + 1)}-${pad(start.getUTCDate())}`;
  const endDate = `${end.getUTCFullYear()}-${pad(end.getUTCMonth() + 1)}-${pad(end.getUTCDate())}`;

  return {
    areaComumId: String(reservation.areaComumId),
    selectedDate,
    startHour: start.getUTCHours(),
    endHour: endDate !== selectedDate ? 24 : end.getUTCHours(),
    status: reservation.status,
  };
}
