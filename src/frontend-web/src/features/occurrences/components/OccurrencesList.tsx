import { MaterialIcon } from "#/components/ui";
import type { Occurrence } from "../types/occurrence";

type Props = { 
  occurrences: Occurrence[];
  isLoading: boolean;
  errorMessage?: string;
};

export function OccurrencesList({ occurrences, isLoading, errorMessage }: Props) {
    if (isLoading) return <p className="text-slate-500 mt-8 text-center">Buscando suas ocorrências...</p>;
    if (errorMessage) return <p className="text-red-500 mt-8 text-center">{errorMessage}</p>;
    if (occurrences.length === 0) return <p className="text-slate-500 mt-8 text-center">Nenhuma ocorrência encontrada.</p>;

    const getStatusStyles = (status: string) => {
        const s = status?.toLowerCase() || '';
        if (s.includes('aberto')) return { border: 'border-l-red-500', dot: 'bg-red-500', badge: 'bg-slate-100 text-slate-700' };
        if (s.includes('análise') || s.includes('analise')) return { border: 'border-l-slate-400', dot: 'bg-slate-400', badge: 'bg-orange-50 text-orange-600' };
        return { border: 'border-l-blue-900', dot: 'bg-stone-300', badge: 'bg-slate-100 text-slate-500' };
    };

    return (
        <div className="space-y-4">
            {occurrences.map((occ) => {
                const styles = getStatusStyles(occ.status);
                
                return (
                    <div key={occ.id} className={`bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex items-center justify-between border-l-[6px] transition-shadow hover:shadow-md ${styles.border}`}>
                        
                        <div className="flex items-center gap-6">
                            <div className="flex flex-col items-center justify-center w-16">
                                <span className="text-[9px] font-bold text-slate-400 tracking-widest uppercase mb-2">Status</span>
                                <div className={`w-3 h-3 rounded-full ${styles.dot}`}></div>
                            </div>
                            <div>
                                <h3 className="text-slate-800 font-semibold text-lg">{occ.title}</h3>
                                <div className="flex items-center gap-3 mt-1.5">
                                    <span className="flex items-center text-xs text-slate-400 font-medium">
                                        <MaterialIcon name="schedule" className="text-[14px] mr-1" />
                                        Criado em {new Date(occ.createdAt).toLocaleDateString("pt-BR")}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-500 mt-2">{occ.description}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <span className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase ${styles.badge}`}>
                                {occ.status}
                            </span>
                            <MaterialIcon name="chevron_right" className="text-slate-300" />
                        </div>

                    </div>
                );
            })}
        </div>
    );
}
