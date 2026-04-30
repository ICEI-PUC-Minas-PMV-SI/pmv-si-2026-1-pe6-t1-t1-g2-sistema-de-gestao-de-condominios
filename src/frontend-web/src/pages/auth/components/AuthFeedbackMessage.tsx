type AuthFeedbackMessageProps = {
	tone: "error" | "success";
	children: string;
};

const toneClasses = {
	error: "bg-red-50 text-red-700",
	success: "bg-emerald-50 text-emerald-700",
};

export function AuthFeedbackMessage({
	tone,
	children,
}: AuthFeedbackMessageProps) {
	return (
		<p
			className={`rounded-xl px-4 py-3 text-sm font-medium ${toneClasses[tone]}`}
		>
			{children}
		</p>
	);
}
