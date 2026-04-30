import type { InputHTMLAttributes, ReactNode } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
	label?: string;
	leftIcon?: ReactNode;
	rightIcon?: ReactNode;
};

export function Input({
	id,
	label,
	leftIcon,
	rightIcon,
	className = "",
	...props
}: InputProps) {
	return (
		<div>
			{label && (
				<label
					className="mb-1.5 block text-sm font-semibold text-gray-700"
					htmlFor={id}
				>
					{label}
				</label>
			)}
			<div className="relative">
				{leftIcon && (
					<span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
						{leftIcon}
					</span>
				)}
				<input
					className={[
						"block w-full rounded-xl border border-gray-200 bg-white py-3 text-sm placeholder-gray-300 focus:border-transparent focus:ring-2 focus:ring-[#2563eb]",
						leftIcon ? "pl-10" : "pl-3",
						rightIcon ? "pr-14" : "pr-3",
						className,
					]
						.filter(Boolean)
						.join(" ")}
					id={id}
					{...props}
				/>
				{rightIcon && (
					<span className="absolute inset-y-0 right-1 flex items-center text-gray-400">
						{rightIcon}
					</span>
				)}
			</div>
		</div>
	);
}
