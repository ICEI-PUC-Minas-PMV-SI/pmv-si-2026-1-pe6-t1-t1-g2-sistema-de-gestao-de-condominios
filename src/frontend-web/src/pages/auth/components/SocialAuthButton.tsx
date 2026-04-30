import type { ReactNode } from "react";

type SocialAuthButtonProps = {
	children?: ReactNode;
	imageAlt?: string;
	imageSrc?: string;
	icon?: ReactNode;
	className?: string;
};

export function SocialAuthButton({
	children,
	imageAlt,
	imageSrc,
	icon,
	className = "",
}: SocialAuthButtonProps) {
	return (
		<button
			className={[
				"flex items-center justify-center gap-2 border border-gray-200 py-3 rounded-xl hover:bg-gray-50 transition-colors",
				className,
			]
				.filter(Boolean)
				.join(" ")}
			type="button"
		>
			{imageSrc && imageAlt && (
				<img alt={imageAlt} className="h-5 w-5" src={imageSrc} />
			)}
			{icon}
			{children}
		</button>
	);
}
