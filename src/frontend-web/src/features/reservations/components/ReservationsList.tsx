import { MaterialIcon } from "#/components/ui";
import type { CommonArea } from "../types/common-area";
import type { Reservation } from "../types/reservation";

type ReservationsListProps = {
  reservations: Reservation[];
  commonAreas: CommonArea[];
  isLoading: boolean;
  isAdmin: boolean;
  errorMessage?: string;
  onEdit: (reservation: Reservation) => void;
  onDelete: (id: number) => void;
};

function getStatusStyles(status: string) {
  const normalized = status.toLowerCase();
  if (normalized === "aprovada") {
    return "bg-emerald-100 text-emerald-700";
  }
  if (normalized === "cancelada") {
    return "bg-rose-100 text-rose-700";
  }
  return "bg-amber-100 text-amber-700";
}

export function ReservationsList({
  reservations,
  commonAreas,
  isLoading,
  isAdmin,
  errorMessage,
  onEdit,
  onDelete,
}: ReservationsListProps) {
  if (isLoading) {
    return <p className="text-slate-500 text-center">Carregando reservas...</p>;
  }

  if (errorMessage) {
    return <p className="text-red-600 text-center">{errorMessage}</p>;
  }

  if (reservations.length === 0) {
    return <p className="text-slate-500 text-center">Nenhuma reserva encontrada.</p>;
  }

  return (
    <div className="space-y-4">
      {reservations.map((reservation) => {
        const areaName =
          commonAreas.find((item) => item.id === reservation.areaComumId)?.name ??
          `Area #${reservation.areaComumId}`;

        return (
          <div
            key={reservation.id}
            className="bg-white rounded-3xl border border-slate-100 px-5 py-4 shadow-sm flex items-center justify-between gap-4"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h3 className="text-slate-800 font-semibold">{areaName}</h3>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyles(
                    reservation.status,
                  )}`}
                >
                  {reservation.status}
                </span>
              </div>
              <p className="text-sm text-slate-500">
                Inicio: {new Date(reservation.dataHoraInicio).toLocaleString("pt-BR")}
              </p>
              <p className="text-sm text-slate-500">
                Fim: {new Date(reservation.dataHoraFim).toLocaleString("pt-BR")}
              </p>
            </div>

            {isAdmin && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onEdit(reservation)}
                  className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
                >
                  <MaterialIcon name="edit" className="text-xl" />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(reservation.id)}
                  className="p-2 rounded-full hover:bg-red-50 text-red-500 transition-colors"
                >
                  <MaterialIcon name="delete" className="text-xl" />
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
