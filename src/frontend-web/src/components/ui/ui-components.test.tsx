import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AuthFeedbackMessage } from "#/pages/auth/components/AuthFeedbackMessage";
import { PasswordVisibilityButton } from "#/pages/auth/components/PasswordVisibilityButton";
import { Button } from "./Button";
import { Input } from "./Input";
import { MaterialIcon } from "./MaterialIcon";
import { Modal } from "./Modal";
import { Spinner } from "./Spinner";

describe("UI components", () => {
	it("Button renderiza label e ícone", () => {
		render(
			<Button icon={<span data-testid="icon">i</span>}>Salvar</Button>,
		);
		expect(screen.getByRole("button", { name: /salvar/i })).toBeTruthy();
		expect(screen.getByTestId("icon")).toBeTruthy();
	});

	it("Input renderiza label e conteúdo", () => {
		render(
			<Input
				id="email"
				label="E-mail"
				leftIcon={<span data-testid="left">L</span>}
				rightIcon={<span data-testid="right">R</span>}
			/>,
		);
		expect(screen.getByLabelText("E-mail")).toBeTruthy();
		expect(screen.getByTestId("left")).toBeTruthy();
		expect(screen.getByTestId("right")).toBeTruthy();
	});

	it("Modal abre e chama onClose", () => {
		const onClose = vi.fn();
		const { rerender } = render(
			<Modal open={false} onClose={onClose} title="Teste">
				<div>Conteúdo</div>
			</Modal>,
		);
		expect(screen.queryByText("Conteúdo")).toBeNull();

		rerender(
			<Modal open={true} onClose={onClose} title="Teste">
				<div>Conteúdo</div>
			</Modal>,
		);
		expect(screen.getByText("Conteúdo")).toBeTruthy();

		fireEvent.click(screen.getByRole("button", { name: /fechar modal/i }));
		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it("Spinner exibe papel status e label opcional", () => {
		render(<Spinner size={40} label="Carregando dados" />);
		expect(screen.getByRole("status", { name: "Carregando dados" })).toBeTruthy();
		expect(screen.getByText("Carregando dados")).toBeTruthy();
	});

	it("MaterialIcon renderiza nome e classe", () => {
		render(<MaterialIcon className="xpto" name="home" />);
		const icon = screen.getByText("home");
		expect(icon.className).toContain("material-symbols-outlined");
		expect(icon.className).toContain("xpto");
	});

	it("AuthFeedbackMessage aplica tom", () => {
		render(<AuthFeedbackMessage tone="error">Falhou</AuthFeedbackMessage>);
		expect(screen.getByText("Falhou").className).toContain("text-red-700");
	});

	it("PasswordVisibilityButton dispara toggle", () => {
		const onToggle = vi.fn();
		render(<PasswordVisibilityButton isVisible={false} onToggle={onToggle} />);
		fireEvent.click(screen.getByRole("button", { name: /mostrar senha/i }));
		expect(onToggle).toHaveBeenCalledTimes(1);
	});
});
