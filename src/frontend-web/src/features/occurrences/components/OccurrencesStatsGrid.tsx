import { MaterialIcon } from "#/components/ui";
import type { OccurrenceStats } from "../types/occurrence";

type Props = { stats: OccurrenceStats; };

export function OccurrencesStatsGrid({ stats }: Props) {
    return (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
                <div className="p-4 rounded-xl bg-slate-100 text-slate-600">
                    <MaterialIcon name="inbox" />
                </div>
                <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Aberto</p>
                    <p className="text-3xl font-bold text-slate-800">{String(stats.totalAberto).padStart(2, '0')}</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
                <div className="p-4 rounded-xl bg-slate-100 text-slate-600">
                    <MaterialIcon name="check_circle" />
                </div>
                <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Resolvidos</p>
                    <p className="text-3xl font-bold text-slate-800">{String(stats.resolvidos).padStart(2, '0')}</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
                <div className="p-4 rounded-xl bg-orange-50 text-orange-500">
                    <MaterialIcon name="schedule" />
                </div>
                <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Em Análise</p>
                    <p className="text-3xl font-bold text-slate-800">{String(stats.emAnalise).padStart(2, '0')}</p>
                </div>
            </div>
        </section>
    );
}
