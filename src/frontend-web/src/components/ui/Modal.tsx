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
				className="bg-surface text-on-surface rounded-xl shadow-2xl w-full max-w-2xl sm:max-w-xl mx-4 p-6 md:p-10 relative flex flex-col animate-fade-in"
				style={{
					minWidth: "320px",
					maxWidth: "600px",
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
