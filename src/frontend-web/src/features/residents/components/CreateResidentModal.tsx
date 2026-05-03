import { Button, Input, Modal } from "#/components/ui";
import type { ChangeEvent, FormEvent } from "react";
import type { ResidentForm } from "../types/resident";

type CreateResidentModalProps = {
	errorMessage?: string;
	form: ResidentForm;
	isPending: boolean;
	onChange: (event: ChangeEvent<HTMLInputElement>) => void;
	onClose: () => void;
	onSubmit: (event: FormEvent<HTMLFormElement>) => void;
	open: boolean;
};

export function CreateResidentModal({
	errorMessage,
	form,
	isPending,
	onChange,
	onClose,
	onSubmit,
	open,
}: CreateResidentModalProps) {
	return (
		<Modal open={open} onClose={onClose} title="Novo Residente">
			<form className="flex flex-col gap-4 w-full" onSubmit={onSubmit}>
				<Input
					id="name"
					label="Nome"
					name="name"
					onChange={onChange}
					placeholder="Nome completo"
					required
					type="text"
					value={form.name}
				/>
				<Input
					id="email"
					label="Email"
					name="email"
					onChange={onChange}
					placeholder="nome@email.com"
					required
					type="email"
					value={form.email}
				/>
				<Input
					id="password"
					label="Senha"
					name="password"
					onChange={onChange}
					placeholder="Defina uma senha inicial"
					required
					type="password"
					value={form.password}
				/>
				{errorMessage && (
					<div className="text-error text-sm">{errorMessage}</div>
				)}
				<div className="flex gap-3 mt-2 justify-end">
					<Button color="primary" size="md" type="submit" disabled={isPending}>
						{isPending ? "Salvando..." : "Cadastrar Residente"}
					</Button>
					<Button color="secondary" size="md" type="button" onClick={onClose}>
						Cancelar
					</Button>
				</div>
			</form>
		</Modal>
	);
}
