import { Button, Input } from "#/components/ui";
import { Link } from "@tanstack/react-router";
import { Building2, Cloud, Lock, Mail, ShieldCheck, User } from "lucide-react";
import { AuthDivider } from "./components/AuthDivider";
import { AuthFeedbackMessage } from "./components/AuthFeedbackMessage";
import { PasswordVisibilityButton } from "./components/PasswordVisibilityButton";
import { SocialAuthButton } from "./components/SocialAuthButton";
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
						<AuthDivider label="ou cadastre-se com" />
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<SocialAuthButton
								provider="google"
								icon={
									<svg aria-hidden="true" className="h-6 w-6" viewBox="0 0 24 24">
										<path
											d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
											fill="#4285F4"
										/>
										<path
											d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
											fill="#34A853"
										/>
										<path
											d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
											fill="#FBBC05"
										/>
										<path
											d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
											fill="#EA4335"
										/>
									</svg>
								}
							/>
							<SocialAuthButton
								provider="apple"
								icon={
									<svg
										aria-hidden="true"
										className="w-5 h-5"
										fill="currentColor"
										viewBox="0 0 384 512"
									>
										<path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
									</svg>
								}
							/>
						</div>
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
