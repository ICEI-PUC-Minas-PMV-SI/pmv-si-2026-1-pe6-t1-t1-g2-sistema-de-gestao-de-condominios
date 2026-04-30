import type { ReactNode } from "react";
import { tv, type VariantProps } from "tailwind-variants";

const button = tv({
	base: "inline-flex items-center justify-center hover:opacity-50 transition-all! not-disabled:cursor-pointer font-label-sm font-semibold font-manrope focus:outline-none rounded-lg gap-2 disabled:opacity-60 disabled:pointer-events-none",
	variants: {
		color: {
			primary: "bg-primary text-on-primary!",
			secondary: "bg-secondary/10 text-surface-tint!",
			blueish: "bg-on-primary-fixed text-on-tertiary!",
			modern: "bg-[#2e4a7d] text-white!",
			transparent: "bg-transparent text-on-surface-variant!",
		},
		size: {
			md: "h-11 px-6 text-[--font-label-sm]",
			lg: "h-14 px-8 text-[--font-headline-md]",
			icon: "h-11 w-11 p-0 text-[--font-label-sm]",
		},
	},
	defaultVariants: {
		color: "primary",
		size: "md",
	},
});

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
	VariantProps<typeof button> & {
		icon?: ReactNode;
		iconPosition?: "left" | "right";
		children?: ReactNode;
	};

export function Button({
	color,
	size,
	icon,
	iconPosition = "left",
	children,
	className = "",
	...props
}: ButtonProps) {
	return (
		<button className={button({ color, size, className })} {...props}>
			{icon && iconPosition === "left" && (
				<span className="flex items-center">{icon}</span>
			)}
			{children}
			{icon && iconPosition === "right" && (
				<span className="flex items-center">{icon}</span>
			)}
		</button>
	);
}
