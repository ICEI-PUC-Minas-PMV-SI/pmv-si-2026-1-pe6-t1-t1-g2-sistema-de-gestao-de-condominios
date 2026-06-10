import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { fetchReservationAvailability } from "../services/reservations-service";
import {
  getAvailableHours,
  getOccupiedHours,
  pad,
} from "../utils/reservation-slots";
import { DateStrip } from "./DateStrip";
import { SlotGrid } from "./SlotGrid";

type ReservationSlotPickerProps = {
  areaComumId: string;
  selectedDate: string;
  startHour: number | null;
  endHour: number | null;
  onChange: (next: {
    selectedDate?: string;
    startHour?: number | null;
    endHour?: number | null;
  }) => void;
};

export function ReservationSlotPicker({
  areaComumId,
  selectedDate,
  startHour,
  endHour,
  onChange,
}: ReservationSlotPickerProps) {
  const availabilityQuery = useQuery({
    queryKey: ["reservation-availability", areaComumId, selectedDate],
    queryFn: () =>
      fetchReservationAvailability(Number(areaComumId), selectedDate),
    enabled: Boolean(areaComumId) && Boolean(selectedDate),
  });

  const occupiedHours = useMemo(
    () => getOccupiedHours(availabilityQuery.data ?? []),
    [availabilityQuery.data],
  );

  function handleSelectHour(h: number) {
    if (startHour === null) {
      onChange({ startHour: h, endHour: null });
      return;
    }

    if (endHour === null) {
      if (h <= startHour) {
        onChange({ startHour: h });
        return;
      }

      const end = h + 1;
      for (let i = startHour; i < end; i++) {
        if (occupiedHours.has(i)) {
          window.alert(
            `O horário ${pad(i)}:00 está reservado. Escolha outro intervalo.`,
          );
          return;
        }
      }

      onChange({ endHour: end });
      return;
    }

    onChange({ startHour: h, endHour: null });
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-sm font-medium text-slate-700">Data</p>
        <DateStrip
          selected={selectedDate}
          onSelect={(iso) =>
            onChange({ selectedDate: iso, startHour: null, endHour: null })
          }
        />
      </div>

      {areaComumId ? (
        <div>
          <p className="mb-2 text-sm font-medium text-slate-700">Horários</p>
          <SlotGrid
            occupiedHours={occupiedHours}
            availableHours={getAvailableHours(selectedDate)}
            startHour={startHour}
            endHour={endHour}
            loading={availabilityQuery.isFetching}
            onSelectHour={handleSelectHour}
          />
        </div>
      ) : (
        <p className="py-4 text-center text-sm text-slate-400">
          Selecione uma área comum para ver os horários disponíveis.
        </p>
      )}
    </div>
  );
}
