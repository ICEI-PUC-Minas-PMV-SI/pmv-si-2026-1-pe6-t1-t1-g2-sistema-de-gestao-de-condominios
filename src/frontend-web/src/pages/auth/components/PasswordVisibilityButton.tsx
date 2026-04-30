import { Eye, EyeOff } from "lucide-react";
import { Button } from "#/components/ui";

type PasswordVisibilityButtonProps = {
	isVisible: boolean;
	onToggle: () => void;
	iconSize?: string;
	strokeWidth?: number;
};

export function PasswordVisibilityButton({
	isVisible,
	onToggle,
	iconSize = "h-5 w-5",
	strokeWidth = 1.5,
}: PasswordVisibilityButtonProps) {
	return (
		<Button
			aria-label={isVisible ? "Ocultar senha" : "Mostrar senha"}
			color="transparent"
			icon={
				isVisible ? (
					<EyeOff className={iconSize} strokeWidth={strokeWidth} />
				) : (
					<Eye className={iconSize} strokeWidth={strokeWidth} />
				)
			}
			onClick={onToggle}
			size="icon"
			type="button"
		/>
	);
}
