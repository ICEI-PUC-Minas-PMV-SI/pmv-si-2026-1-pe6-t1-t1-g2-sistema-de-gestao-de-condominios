type AuthDividerProps = {
	label: string;
};

export function AuthDivider({ label }: AuthDividerProps) {
	return (
		<div className="relative my-7">
			<div className="absolute inset-0 flex items-center">
				<span className="w-full border-t border-gray-200" />
			</div>
			<div className="relative flex justify-center text-[10px] uppercase">
				<span className="bg-white px-3 text-gray-400 tracking-wider">
					{label}
				</span>
			</div>
		</div>
	);
}
