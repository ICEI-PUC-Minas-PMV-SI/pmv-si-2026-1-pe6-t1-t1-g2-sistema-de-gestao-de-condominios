import { Button, Input, Modal } from "#/components/ui";
import type { ChangeEvent, FormEvent } from "react";
import type { CreateOccurrenceForm } from "../types/occurrence";

type Props = {
    errorMessage?: string;
    form: CreateOccurrenceForm;
    isPending: boolean;
    onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    onFileChange: (file: File | null) => void; // Adicionado
    onClose: () => void;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
    open: boolean;
};

export function CreateOccurrenceModal({ 
    errorMessage, 
    form, 
    isPending, 
    onChange, 
    onFileChange, 
    onClose, 
    onSubmit, 
    open 
}: Props) {
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

                <div className="flex flex-col gap-1">
                    <label htmlFor="file" className="text-sm font-medium text-slate-700">Anexar Imagem ou Vídeo</label>
                    <input
                        id="file"
                        type="file"
                        accept="image/*,video/*" // Aceita imagens e vídeos
                        onChange={(e) => onFileChange(e.target.files?.[0] || null)}
                        className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
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