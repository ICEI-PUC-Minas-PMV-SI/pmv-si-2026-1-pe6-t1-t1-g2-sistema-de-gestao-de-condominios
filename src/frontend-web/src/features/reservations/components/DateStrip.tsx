import { useMemo } from "react";
import {
  DAY_NAMES_LONG,
  buildDaysArray,
  getLocalTodayISO,
  pad,
} from "../utils/reservation-slots";

type DateStripProps = {
  selected: string;
  onSelect: (iso: string) => void;
};

export function DateStrip({ selected, onSelect }: DateStripProps) {
  const days = useMemo(() => buildDaysArray(30), []);
  const todayISO = getLocalTodayISO();

  return (
    <div className="space-y-3">
      <div className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {days.map((d) => {
          const isSelected = d.iso === selected;
          const isToday = d.iso === todayISO;

          return (
            <button
              key={d.iso}
              type="button"
              onClick={() => onSelect(d.iso)}
              className={`flex h-[4.5rem] min-w-[3.25rem] shrink-0 snap-start flex-col items-center justify-center gap-1 rounded-2xl border transition-all duration-200 ${
                isSelected
                  ? "border-primary bg-primary text-white shadow-lg shadow-primary/30 scale-105"
                  : "border-transparent bg-slate-100 text-slate-600 hover:border-primary/30 hover:bg-slate-200"
              }`}
            >
              <span
                className={`text-[10px] font-bold uppercase tracking-wider ${
                  isSelected ? "text-white/80" : "text-slate-400"
                }`}
              >
                {d.dayName}
              </span>
              <span className="text-lg font-extrabold leading-none">{d.dayNum}</span>
              {isToday && (
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    isSelected ? "bg-white" : "bg-primary"
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>
      {selected && (
        <p className="text-sm font-semibold text-slate-700">
          {(() => {
            const d = new Date(`${selected}T12:00:00`);
            const label = `${DAY_NAMES_LONG[d.getDay()]}, ${pad(d.getDate())} de ${d.toLocaleDateString("pt-BR", { month: "long" })} de ${d.getFullYear()}`;
            return selected === todayISO ? `Hoje · ${label}` : label;
          })()}
        </p>
      )}
    </div>
  );
}
