import { Button, MaterialIcon } from "#/components/ui";

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
				<span className="inline-block px-3 py-1 text-[11px] font-bold tracking-wider text-[#3949AB] bg-[#E8EAF6] rounded-full uppercase">
					Gestão de Residentes
				</span>
				<h1 className="text-3xl font-bold text-slate-800">
					Lista de Residentes
				</h1>
				<p className="text-slate-500">
					Visualize e gerencie os moradores cadastrados no condomínio.
				</p>
			</div>
			{showCreate && (
				<Button
					color="modern"
					icon={<MaterialIcon name="person_add" />}
					onClick={onCreateClick}
				>
					Novo Residente
				</Button>
			)}
		</header>
	);
}
