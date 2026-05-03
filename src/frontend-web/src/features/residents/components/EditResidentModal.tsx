import { Button, Input, MaterialIcon, Modal } from "#/components/ui";
import type { EditResidentForm } from "../types/resident";

type EditResidentModalProps = {
	form: EditResidentForm;
	isLoading?: boolean;
	onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
	onClose: () => void;
	onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
	open: boolean;
	resident?: { name: string } | null;
};

export function EditResidentModal({
	form,
	isLoading = false,
	onChange,
	onClose,
	onSubmit,
	open,
	resident,
}: EditResidentModalProps) {
	return (
		<Modal open={open} onClose={onClose} title="Editar Residente">
			<form onSubmit={onSubmit} className="space-y-6">
				<div className="space-y-4">
					<Input
						disabled={isLoading}
						label="Nome"
						name="username"
						onChange={onChange}
						placeholder="Nome completo"
						type="text"
						value={form.username}
						required
					/>

					<Input
						disabled={isLoading}
						label="E-mail"
						name="email"
						onChange={onChange}
						placeholder="seu@email.com"
						type="email"
						value={form.email}
						required
					/>

					<div>
						<label className="block text-sm font-medium text-slate-700 mb-2">
							Perfil
						</label>
						<select
							disabled={isLoading}
							name="profile"
							onChange={onChange}
							value={form.profile}
							className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
						>
							<option value="Morador">Morador</option>
							<option value="Administrador">Administrador</option>
						</select>
					</div>
				</div>

				<div className="flex gap-3 justify-end">
					<Button
						color="secondary"
						disabled={isLoading}
						onClick={onClose}
						size="md"
						type="button"
					>
						Cancelar
					</Button>
					<Button
						color="primary"
						disabled={isLoading}
						icon={<MaterialIcon name="save" />}
						size="md"
						type="submit"
					>
						{isLoading ? "Salvando..." : "Salvar"}
					</Button>
				</div>
			</form>
		</Modal>
	);
}
