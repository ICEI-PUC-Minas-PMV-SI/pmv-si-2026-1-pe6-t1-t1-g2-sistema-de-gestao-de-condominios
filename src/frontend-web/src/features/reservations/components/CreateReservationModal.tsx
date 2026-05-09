import { Button, Modal } from "#/components/ui";
import type { CommonArea } from "../types/common-area";
import type { ReservationForm, ReservationStatus } from "../types/reservation";

type CreateReservationModalProps = {
  open: boolean;
  isPending: boolean;
  isAdmin: boolean;
  form: ReservationForm;
  areas: CommonArea[];
  errorMessage?: string;
  onClose: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
};

const statusOptions: ReservationStatus[] = ["Pendente", "Aprovada", "Cancelada"];

export function CreateReservationModal({
  open,
  isPending,
  isAdmin,
  form,
  areas,
  errorMessage,
  onClose,
  onSubmit,
  onChange,
}: CreateReservationModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="Solicitar reserva">
      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="areaComumId">
            Area comum
          </label>
          <select
            id="areaComumId"
            name="areaComumId"
            value={form.areaComumId}
            onChange={onChange}
            required
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
          >
            <option value="">Selecione uma area</option>
            {areas.map((area) => (
              <option key={area.id} value={area.id}>
                {area.name} (capacidade: {area.capacity})
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="dataInicio">
              Data de início
            </label>
            <input
              id="dataInicio"
              name="dataInicio"
              type="date"
              value={form.dataInicio}
              onChange={onChange}
              required
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="horaInicio">
              Hora de início
            </label>
            <input
              id="horaInicio"
              name="horaInicio"
              type="time"
              value={form.horaInicio}
              onChange={onChange}
              required
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="dataFim">
              Data de fim
            </label>
            <input
              id="dataFim"
              name="dataFim"
              type="date"
              value={form.dataFim}
              onChange={onChange}
              required
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="horaFim">
              Hora de fim
            </label>
            <input
              id="horaFim"
              name="horaFim"
              type="time"
              value={form.horaFim}
              onChange={onChange}
              required
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            />
          </div>
        </div>

        {isAdmin && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="status">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={form.status}
              onChange={onChange}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        )}

        {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" color="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" color="modern" disabled={isPending}>
            {isPending ? "Salvando..." : "Salvar reserva"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
