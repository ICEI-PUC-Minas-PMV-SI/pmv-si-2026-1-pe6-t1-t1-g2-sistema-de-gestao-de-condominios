import { pad } from "../utils/reservation-slots";

type SlotState =
  | "occupied"
  | "selected-start"
  | "selected-end"
  | "selected-range"
  | "free";

type SlotGridProps = {
  occupiedHours: Set<number>;
  availableHours: number[];
  startHour: number | null;
  endHour: number | null;
  loading: boolean;
  onSelectHour: (h: number) => void;
};

function getSlotState(
  h: number,
  occupiedHours: Set<number>,
  startHour: number | null,
  endHour: number | null,
): SlotState {
  if (occupiedHours.has(h)) return "occupied";
  if (startHour !== null && endHour !== null) {
    if (h === startHour) return "selected-start";
    if (h === endHour - 1) return "selected-end";
    if (h > startHour && h < endHour - 1) return "selected-range";
  } else if (startHour !== null && h === startHour) {
    return "selected-start";
  }
  return "free";
}

const SLOT_CLASSES: Record<SlotState, string> = {
  occupied: "bg-slate-200 text-slate-400 line-through cursor-not-allowed",
  "selected-start": "bg-primary text-white ring-2 ring-offset-1 ring-primary/40",
  "selected-end": "bg-primary text-white ring-2 ring-offset-1 ring-primary/40",
  "selected-range": "bg-primary/80 text-white",
  free: "bg-slate-100 text-slate-700 hover:bg-slate-200",
};

const SLOT_CAPTIONS: Partial<Record<SlotState, string>> = {
  occupied: "Ocupado",
};

export function SlotGrid({
  occupiedHours,
  availableHours,
  startHour,
  endHour,
  loading,
  onSelectHour,
}: SlotGridProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-4 text-xs text-slate-500">
        <LegendDot className="bg-primary" label="Selecionado" />
        <LegendDot className="border border-slate-200 bg-slate-100" label="Livre" />
        <LegendDot className="bg-slate-200" label="Ocupado" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-8 text-sm text-slate-400">
          Verificando disponibilidade...
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
          {availableHours.length === 0 && (
            <p className="col-span-full py-4 text-center text-sm text-slate-400">
              Não há mais horários disponíveis hoje.
            </p>
          )}
          {availableHours.map((h) => {
            const state = getSlotState(h, occupiedHours, startHour, endHour);
            const isOccupied = state === "occupied";
            const caption = SLOT_CAPTIONS[state];

            return (
              <button
                key={h}
                type="button"
                disabled={isOccupied}
                onClick={() => onSelectHour(h)}
                className={`flex flex-col items-center gap-0.5 rounded-xl py-2.5 text-sm font-bold transition-colors ${SLOT_CLASSES[state]}`}
              >
                <span>{pad(h)}:00</span>
                {caption && <span className="text-[10px] font-semibold uppercase tracking-wide no-underline">{caption}</span>}
              </button>
            );
          })}
        </div>
      )}

      {startHour !== null && endHour !== null && (
        <div className="flex items-center gap-2 rounded-xl bg-primary/10 p-3 text-sm font-bold text-primary">
          {pad(startHour)}:00 – {pad(endHour)}:00 · {endHour - startHour}h de duração
        </div>
      )}
      {startHour !== null && endHour === null && (
        <p className="text-center text-xs text-slate-500">
          Toque em outro horário para definir o término
        </p>
      )}
      {startHour === null && (
        <p className="text-center text-xs text-slate-500">
          Toque em um horário para iniciar a seleção
        </p>
      )}
    </div>
  );
}

function LegendDot({ className, label }: { className: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`h-3 w-3 rounded-sm ${className}`} />
      {label}
    </span>
  );
}
