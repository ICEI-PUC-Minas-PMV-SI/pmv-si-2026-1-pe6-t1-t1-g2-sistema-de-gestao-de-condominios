import { MaterialIcon } from "./MaterialIcon";

type DeliveryTopbarProps = {
	onSearchTermChange: (value: string) => void;
	searchTerm: string;
};

export function DeliveryTopbar({
	onSearchTermChange,
	searchTerm,
}: DeliveryTopbarProps) {
	return (
		<header className="flex justify-between items-center px-6 py-3 sticky top-0 z-40 bg-white/90 backdrop-blur-md font-manrope text-sm antialiased shadow-sm border-b border-slate-100 ml-64 w-[calc(100%-16rem)]">
			<div className="flex items-center bg-slate-50 rounded-full px-4 py-1.5 w-96 border border-slate-100 transition-all focus-within:ring-2 focus-within:ring-primary/20">
				<MaterialIcon name="search" className="text-slate-400 text-sm mr-2" />
				<input
					className="bg-transparent border-none text-xs focus:ring-0 w-full text-slate-600 placeholder:text-slate-400"
					onChange={(event) => onSearchTermChange(event.target.value)}
					placeholder="Filtrar por morador, descrição ou status..."
					type="text"
					value={searchTerm}
				/>
			</div>
			<div className="flex items-center gap-4">
				<button
					className="w-10 h-10 flex items-center justify-center text-slate-600 hover:bg-slate-50 rounded-full transition-colors relative"
					type="button"
				>
					<MaterialIcon name="notifications" />
					<span className="absolute top-2.5 right-2.5 w-2 h-2 bg-error rounded-full border-2 border-white" />
				</button>
				<button
					className="w-10 h-10 flex items-center justify-center text-slate-600 hover:bg-slate-50 rounded-full transition-colors"
					type="button"
				>
					<MaterialIcon name="account_circle" />
				</button>
			</div>
		</header>
	);
}
