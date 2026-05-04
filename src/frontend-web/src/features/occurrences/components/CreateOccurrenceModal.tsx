import { Button, Input, Modal } from "#/components/ui";
import type { ChangeEvent, FormEvent } from "react";
import type { CreateOccurrenceForm } from "../types/occurrence";

type Props = {
    errorMessage?: string;
    form: CreateOccurrenceForm;
    isPending: boolean;
    onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    onClose: () => void;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
    open: boolean;
};

export function CreateOccurrenceModal({ errorMessage, form, isPending, onChange, onClose, onSubmit, open }: Props) {
    return (
        <Modal open={open} onClose={onClose} title="Nova Ocorrência">
            <form className="flex flex-col gap-4 w-full" onSubmit={onSubmit}>
                <Input
                    id="title"
                    label="Título Resumido"
                    name="title"
                    onChange={onChange}
                    placeholder="Ex: Vazamento no Bloco B"
                    required
                    type="text"
                    value={form.title}
                />
                <div className="flex flex-col gap-1">
                    <label htmlFor="description" className="text-sm font-medium text-slate-700">Descrição detalhada</label>
                    <textarea
                        id="description"
                        name="description"
                        onChange={onChange}
                        required
                        rows={4}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none text-slate-800"
                        placeholder="Descreva o que está acontecendo..."
                        value={form.description}
                    />
                </div>
                
                {errorMessage && <div className="text-red-500 text-sm">{errorMessage}</div>}
                
                <div className="flex gap-3 mt-4 justify-end">
                    <Button color="primary" size="md" type="submit" disabled={isPending}>
                        {isPending ? "Registrando..." : "Registrar Ocorrência"}
                    </Button>
                    <Button color="secondary" size="md" type="button" onClick={onClose} disabled={isPending}>
                        Cancelar
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
