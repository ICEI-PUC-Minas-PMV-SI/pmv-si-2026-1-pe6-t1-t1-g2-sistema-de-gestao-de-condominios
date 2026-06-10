import { MaterialIcon } from "#/components/ui";
import type { ApprovedReservationStats } from "../utils/reservation-slots";

type Props = { stats: ApprovedReservationStats };

export function ReservationsStatsGrid({ stats }: Props) {
  return (
    <section className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-6">
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4 md:p-6">
        <div className="p-4 rounded-xl bg-emerald-50 text-emerald-600">
          <MaterialIcon name="event_available" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Aprovadas para hoje
          </p>
          <p className="text-3xl font-bold text-slate-800">
            {String(stats.today).padStart(2, "0")}
          </p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4 md:p-6">
        <div className="p-4 rounded-xl bg-blue-50 text-blue-600">
          <MaterialIcon name="event_upcoming" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Aprovadas para amanhã
          </p>
          <p className="text-3xl font-bold text-slate-800">
            {String(stats.tomorrow).padStart(2, "0")}
          </p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4 md:p-6">
        <div className="p-4 rounded-xl bg-slate-100 text-slate-600">
          <MaterialIcon name="date_range" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Aprovadas na semana
          </p>
          <p className="text-3xl font-bold text-slate-800">
            {String(stats.thisWeek).padStart(2, "0")}
          </p>
        </div>
      </div>
    </section>
  );
}
