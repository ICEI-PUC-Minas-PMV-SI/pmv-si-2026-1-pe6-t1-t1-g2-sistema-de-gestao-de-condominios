import { Button, MaterialIcon, Modal } from "#/components/ui";

type DeleteConfirmationModalProps = {
	isLoading?: boolean;
	onClose: () => void;
	onConfirm: () => void;
	open: boolean;
	residentName?: string;
};

export function DeleteConfirmationModal({
	isLoading = false,
	onClose,
	onConfirm,
	open,
	residentName = "este residente",
}: DeleteConfirmationModalProps) {
	return (
		<Modal open={open} onClose={onClose} title="Confirmar Exclusão">
			<div className="space-y-6">
				<div className="bg-red-50 border border-red-200 rounded-lg p-4">
					<p className="text-sm text-slate-700">
						Tem certeza que deseja excluir <span className="font-semibold">{residentName}</span>?
					</p>
					<p className="text-xs text-slate-500 mt-2">
						Esta ação não pode ser desfeita.
					</p>
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
						icon={<MaterialIcon name="delete" />}
						size="md"
						onClick={onConfirm}
						type="button"
					>
						{isLoading ? "Excluindo..." : "Excluir"}
					</Button>
				</div>
			</div>
		</Modal>
	);
}
