import { Button } from "#/components/ui";

type ResidentsPageHeaderProps = {
	onCreateClick?: () => void;
	showCreate?: boolean;
};

export function ResidentsPageHeader({
	onCreateClick,
	showCreate = true,
}: ResidentsPageHeaderProps) {
	return (
		<header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
			<div className="space-y-1">
				<span className="bg-surface-container-high text-primary font-label-sm text-xs px-3 py-1 rounded-full tracking-wider">
					GESTÃO DE RESIDENTES
				</span>
				<h1 className="text-headline-md font-headline-md text-slate-900 mt-2">
					Lista de Residentes
				</h1>
				<p className="text-slate-500 font-body-md text-sm mt-1">
					Visualize e gerencie os moradores cadastrados no condomínio.
				</p>
			</div>
			{showCreate && (
				<Button
					color="primary"
					size="md"
					className="whitespace-nowrap"
					onClick={onCreateClick}
				>
					Novo Residente
				</Button>
			)}
		</header>
	);
}
