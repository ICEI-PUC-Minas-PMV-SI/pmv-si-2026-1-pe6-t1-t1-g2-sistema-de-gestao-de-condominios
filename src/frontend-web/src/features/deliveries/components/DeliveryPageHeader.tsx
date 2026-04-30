import { Button } from "#/components/ui";

type DeliveryPageHeaderProps = {
	onCreateClick: () => void;
};

export function DeliveryPageHeader({ onCreateClick }: DeliveryPageHeaderProps) {
	return (
		<div className="flex justify-between items-end">
			<div>
				<span className="bg-surface-container-high text-primary font-label-sm text-xs px-3 py-1 rounded-full tracking-wider">
					LOGÍSTICA INTERNA
				</span>
				<h2 className="text-headline-md font-headline-md text-slate-900 mt-2">
					Gestão de Encomendas
				</h2>
				<p className="text-slate-500 font-body-md text-sm mt-1">
					Monitore e gerencie o fluxo de pacotes do condomínio.
				</p>
			</div>
			<Button color="primary" size="md" onClick={onCreateClick}>
				Nova Encomenda
			</Button>
		</div>
	);
}
