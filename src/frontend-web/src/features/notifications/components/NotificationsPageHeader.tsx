import { Button, MaterialIcon } from "#/components/ui";

type NotificationsPageHeaderProps = {
	onCreateClick: () => void;
	showCreate: boolean;
};

export function NotificationsPageHeader({
	onCreateClick,
	showCreate,
}: NotificationsPageHeaderProps) {
	return (
		<div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
			<div>
				<span className="bg-surface-container-high text-primary font-label-sm text-xs px-3 py-1 rounded-full tracking-wider">
					COMUNICACAO
				</span>
				<h2 className="text-headline-md font-headline-md text-slate-900 mt-2">
					Central de Notificacoes
				</h2>
				<p className="text-slate-500 font-body-md text-sm mt-1">
					Acompanhe avisos enviados para moradores sobre encomendas e reservas.
				</p>
			</div>
			{showCreate && (
				<Button
					color="primary"
					icon={<MaterialIcon name="add_alert" />}
					onClick={onCreateClick}
					size="md"
					type="button"
				>
					Nova Notificacao
				</Button>
			)}
		</div>
	);
}
