import { Button, Input } from "#/components/ui";
import { Link } from "@tanstack/react-router";
import { Building2, Cloud, Lock, Mail, ShieldCheck, User } from "lucide-react";
import { AuthFeedbackMessage } from "./components/AuthFeedbackMessage";
import { PasswordVisibilityButton } from "./components/PasswordVisibilityButton";
import { useRegisterForm } from "./hooks/useRegisterForm";

export function RegisterPage() {
	const {
		form,
		handleSubmit,
		isPasswordVisible,
		mutation,
		togglePasswordVisibility,
		updateField,
	} = useRegisterForm();

	return (
		<div className="flex min-h-screen w-full flex-col items-stretch overflow-x-hidden bg-[#f6fafd] [overflow-wrap:normal] md:flex-row">
			<section className="relative flex min-h-screen w-full min-w-0 flex-col justify-start overflow-hidden bg-[#eaf4fe] p-8 md:min-h-0 md:basis-1/2 md:p-16 lg:p-24">
				<div className="z-10" style={{ minHeight: "60px" }}>
					<h1 className="text-[20px] font-bold tracking-tight text-[#1e293b] mb-12">
						Gestão de Condomínios
					</h1>
				</div>
				<div className="z-10 mx-auto flex w-[min(100%,32rem)] min-w-0 flex-1 flex-col justify-center pt-8">
					<span className="mb-6 inline-block self-start whitespace-nowrap rounded-full border border-blue-100 bg-white px-5 py-1.5 text-[13px] font-bold uppercase tracking-widest text-[#2563eb] shadow-sm">
						GESTÃO INTELIGENTE
					</span>
					<h2 className="text-5xl md:text-6xl font-extrabold leading-[1.1] text-[#111827] mb-6">
						Bem-vindo ao
						<br />
						<span className="text-[#2e4a7d]">Gestão de Condomínios</span>
					</h2>
					<p className="text-base text-[#334155] leading-relaxed mb-10 max-w-[28rem] w-full">
						A plataforma definitiva para elevar a gestão condominial a um novo
						patamar de eficiência, transparência e tranquilidade digital.
					</p>
					<div className="flex gap-8 justify-center mt-2">
						{[
							<Building2 className="h-8 w-8 text-[#2563eb]" key="building" />,
							<ShieldCheck className="h-8 w-8 text-[#2563eb]" key="shield" />,
							<Cloud className="h-8 w-8 text-[#2563eb]" key="cloud" />,
						].map((icon) => (
							<div
								className="w-16 h-16 bg-white rounded-2xl shadow-md flex items-center justify-center border border-[#eaf4fe]"
								key={icon.key}
							>
								{icon}
							</div>
						))}
					</div>
				</div>
			</section>

			<main className="relative flex min-h-screen w-full min-w-0 flex-col items-center justify-center bg-white p-8 md:min-h-0 md:basis-1/2 lg:p-12">
				<div className="flex justify-end w-full max-w-[42rem] mx-auto mb-8 md:absolute md:top-10 md:right-10">
					<Link
						className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 shadow-none transition-colors hover:bg-gray-50"
						to="/login"
					>
						Entrar
					</Link>
				</div>
				<div className="flex min-w-0 flex-1 items-center justify-center w-full h-full">
					<div
						className="flex w-[min(100%,28rem)] min-w-0 flex-col rounded-[32px] border border-gray-100 bg-white p-10 shadow-[0_4px_32px_0_rgba(16,30,54,0.08)]"
						data-purpose="registration-card"
					>
						<div className="mb-6">
							<h2 className="text-2xl font-extrabold text-[#111827] mb-1">
								Criar sua conta
							</h2>
							<p className="text-gray-500 text-base">
								Comece sua jornada hoje mesmo.
							</p>
						</div>
						<form className="space-y-5" onSubmit={handleSubmit}>
							<Input
								id="name"
								label="Nome Completo"
								leftIcon={<User className="h-5 w-5" strokeWidth={1.5} />}
								name="name"
								onChange={updateField("username")}
								placeholder="Seu nome"
								required
								type="text"
								value={form.username}
							/>
							<Input
								id="email"
								label="E-mail"
								leftIcon={<Mail className="h-5 w-5" strokeWidth={1.5} />}
								name="email"
								onChange={updateField("email")}
								placeholder="email@exemplo.com"
								required
								type="email"
								value={form.email}
							/>
							<Input
								id="password"
								label="Senha"
								leftIcon={<Lock className="h-5 w-5" strokeWidth={1.5} />}
								name="password"
								onChange={updateField("password")}
								placeholder="••••••••"
								required
								rightIcon={
									<PasswordVisibilityButton
										isVisible={isPasswordVisible}
										onToggle={togglePasswordVisibility}
									/>
								}
								type={isPasswordVisible ? "text" : "password"}
								value={form.password}
							/>
							{mutation.isError && (
								<AuthFeedbackMessage tone="error">
									{mutation.error.message}
								</AuthFeedbackMessage>
							)}
							{mutation.isSuccess && (
								<AuthFeedbackMessage tone="success">
									Conta criada com sucesso.
								</AuthFeedbackMessage>
							)}
							<Button
								color="blueish"
								className="w-full"
								disabled={mutation.isPending}
								type="submit"
							>
								{mutation.isPending ? "Criando conta..." : "Criar conta"}
								<span className="material-symbols-outlined text-2xl">
									arrow_forward
								</span>
							</Button>
						</form>
						<p className="text-center mt-8 text-sm text-gray-500">
							Já tem uma conta?{" "}
							<Link
								className="text-gray-900 font-semibold hover:underline"
								to="/login"
							>
								Entre aqui
							</Link>
						</p>
					</div>
				</div>
			</main>
		</div>
	);
}
