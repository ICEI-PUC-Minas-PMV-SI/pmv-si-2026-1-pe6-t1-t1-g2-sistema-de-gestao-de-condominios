import type { ReactNode } from "react";

type ModalProps = {
	open: boolean;
	onClose: () => void;
	title?: string;
	children: ReactNode;
};

export function Modal({ open, onClose, title, children }: ModalProps) {
	if (!open) return null;

	return (
		<div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm transition-all">
			<div
				className="bg-surface text-on-surface mx-4 flex w-full max-w-[calc(100vw-2rem)] flex-col rounded-xl p-6 shadow-2xl animate-fade-in sm:max-w-xl md:max-w-2xl md:p-10"
				style={{
					minWidth: "320px",
					maxHeight: "90vh",
					overflowY: "auto",
				}}
			>
				<button
					aria-label="Fechar modal"
					className="absolute top-3 right-3 text-on-surface-variant hover:text-error transition-colors p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/30"
					onClick={onClose}
					type="button"
				>
					<span className="material-symbols-outlined text-2xl">close</span>
				</button>
				{title && (
					<h2 className="text-headline-md font-headline-md mb-6 text-on-surface font-bold tracking-tight">
						{title}
					</h2>
				)}
				<div className="flex flex-col gap-4 w-full">{children}</div>
			</div>
		</div>
	);
}
