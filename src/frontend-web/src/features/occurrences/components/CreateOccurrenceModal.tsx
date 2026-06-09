import { Button, Input, Modal, MaterialIcon } from "#/components/ui";
import type { ChangeEvent, FormEvent } from "react";
import type { CreateOccurrenceForm } from "../types/occurrence";

type Props = {
  errorMessage?: string;
  form: CreateOccurrenceForm;
  isPending: boolean;
  isEditing: boolean;
  isAdmin: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onFileChange: (file: File | null) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  open: boolean;
};

export function CreateOccurrenceModal({
  errorMessage,
  form,
  isPending,
  isEditing,
  isAdmin,
  onChange,
  onFileChange,
  onClose,
  onSubmit,
  open,
}: Props) {
  const isFieldDisabled = isEditing && isAdmin;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? (isAdmin ? "Gerenciar Status" : "Editar Ocorrência") : "Nova Ocorrência"}
    >
      <form className="flex flex-col gap-5 w-full" onSubmit={onSubmit}>
        
        {/* EXIBIÇÃO DA FOTO (Apenas em Edição se existir Imagem) */}
        {isEditing && form.imageUrl && (
          <div className="flex flex-col gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 ml-1">
              <MaterialIcon name="image" className="text-base" />
              Evidência do Problema
            </label>
            <div className="relative group">
              <img
                src={`${import.meta.env.VITE_BACKEND_URL}${form.imageUrl}`}
                alt="Anexo"
                className="w-full h-48 object-cover rounded-xl border border-slate-200 shadow-sm cursor-pointer hover:opacity-95 transition-opacity"
                onClick={() => window.open(`${import.meta.env.VITE_BACKEND_URL}${form.imageUrl}`, '_blank')}
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <span className="bg-slate-800/60 text-white text-[10px] px-3 py-1 rounded-full font-medium">
                  Clique para ampliar
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Título */}
        <Input
          id="title"
          label="Título Resumido"
          name="title"
          onChange={onChange}
          placeholder="Ex: Vazamento no Bloco B"
          required
          type="text"
          value={form.title}
          disabled={isFieldDisabled}
        />

        {/* Descrição */}
        <div className="flex flex-col gap-1">
          <label htmlFor="description" className="text-sm font-medium text-slate-700">
            Descrição detalhada
          </label>
          <textarea
            id="description"
            name="description"
            onChange={onChange}
            required
            rows={4}
            disabled={isFieldDisabled}
            className={`w-full px-3 py-2 border border-slate-300 rounded-lg outline-none resize-none text-slate-800 transition-all ${
              isFieldDisabled
                ? "bg-slate-50 text-slate-400 cursor-not-allowed border-slate-200"
                : "focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            }`}
            placeholder="Descreva o que está acontecendo..."
            value={form.description}
          />
        </div>

        {/* Status: Apenas Admin na Edição */}
        {isEditing && isAdmin && (
          <div className="flex flex-col gap-1">
            <label htmlFor="status" className="text-sm font-medium text-slate-700">
              Status da Ocorrência
            </label>
            <select
              id="status"
              name="status"
              value={form.status || "Aberto"}
              onChange={onChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none bg-white text-slate-800 focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="Aberto">Aberto</option>
              <option value="Em Andamento">Em Andamento</option>
              <option value="Resolvido">Resolvido</option>
              <option value="Cancelado">Cancelado</option>
            </select>
          </div>
        )}

        {/* Anexo: Apenas Morador na Criação */}
        {!isEditing && !isAdmin && (
          <div className="flex flex-col gap-1">
            <label htmlFor="file" className="text-sm font-medium text-slate-700">
              Anexar Imagem ou Vídeo
            </label>
            <input
              id="file"
              type="file"
              accept="image/*,video/*"
              onChange={(e) => onFileChange(e.target.files?.[0] || null)}
              className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
            />
          </div>
        )}

        {errorMessage && <div className="text-red-500 text-sm font-medium">{errorMessage}</div>}

        <div className="flex gap-3 mt-4 justify-end border-t pt-5 border-slate-100">
          <Button color="secondary" size="md" type="button" onClick={onClose} disabled={isPending}>
            Cancelar
          </Button>
          <Button color="primary" size="md" type="submit" disabled={isPending}>
            {isPending ? "Processando..." : isEditing ? "Salvar Alterações" : "Registrar Ocorrência"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}