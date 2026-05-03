import { Button, Input } from "#/components/ui";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Lock, Settings, User } from "lucide-react";
import { AuthFeedbackMessage } from "./components/AuthFeedbackMessage";
import { PasswordVisibilityButton } from "./components/PasswordVisibilityButton";
import { SocialAuthButton } from "./components/SocialAuthButton";
import { GOOGLE_LOGIN_ICON_URL, SOCIAL_PROOF_IMAGES } from "./constants";
import { useLoginForm } from "./hooks/useLoginForm";

export function LoginPage() {
	const {
		form,
		handleSubmit,
		isPasswordVisible,
		mutation,
		togglePasswordVisibility,
		updateField,
	} = useLoginForm();

	return (
		<main className="flex min-h-screen flex-col overflow-hidden bg-[#f4f7f9] text-[#1f2937] [overflow-wrap:normal] lg:flex-row">
			<section className="relative flex min-h-[48rem] flex-[1.2] flex-col justify-center overflow-hidden bg-[#f4f7f9] p-8 sm:p-12 lg:min-h-screen lg:p-24">
				<div className="absolute right-0 top-0 z-0 h-1/2 w-3/5 opacity-80">
					<svg
						aria-hidden="true"
						className="h-full w-full rounded-bl-[100px] bg-slate-200 object-cover"
						preserveAspectRatio="xMidYMid slice"
						viewBox="0 0 400 400"
					>
						<circle cx="150" cy="150" fill="#fbcfe8" opacity="0.9" r="120" />
						<circle cx="280" cy="220" fill="#bfdbfe" opacity="0.9" r="140" />
						<circle cx="100" cy="300" fill="#fecdd3" opacity="0.9" r="80" />
						<circle cx="300" cy="100" fill="#bae6fd" opacity="0.9" r="60" />
					</svg>
				</div>

				<div className="relative z-10 w-[min(100%,36rem)] min-w-0">
					<div className="mb-12 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm">
						<Settings className="h-4 w-4 text-gray-700" strokeWidth={2} />
						<span className="text-xs font-bold uppercase tracking-wider text-gray-700">
							Modernidade Soft
						</span>
					</div>

					<h1 className="mb-8 text-5xl font-bold leading-tight text-[#1f2937] lg:text-7xl">
						Bem-vindo ao<br />
						<span className="text-[#2e4a7d]">Gestão de Condomínios</span>
					</h1>

					<p className="mb-12 w-[min(100%,28rem)] text-lg leading-relaxed text-[#6b7280]">
						Vivencie a gestão condominial como um santuário digital. Simples,
						fluido e projetado para a sua paz de espírito.
					</p>

					<div className="flex flex-col gap-4 sm:flex-row sm:items-center">
						<div className="flex">
							{SOCIAL_PROOF_IMAGES.map((image, index) => (
								<img
									alt={`Morador ${index + 1}`}
									className="-ml-2 h-8 w-8 rounded-full border-2 border-white first:ml-0"
									key={image}
									src={image}
								/>
							))}
						</div>
						<span className="text-sm text-[#6b7280]">
							Junte-se a mais de 2.000 condomínios
						</span>
					</div>
				</div>
			</section>

			<section className="flex flex-1 flex-col items-center justify-center px-6 py-12 sm:px-8">
				<div
					className="w-full max-w-[27.5rem] rounded-[40px] bg-white px-8 py-12 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.05)] sm:px-10"
					data-purpose="login-form-card"
				>
					<h2 className="mb-1 text-2xl font-bold text-gray-900">
						Entrar na plataforma
					</h2>
					<p className="mb-8 text-sm text-[#6b7280]">
						Insira seu ID de usuário e senha para acessar sua conta.
					</p>

					<form className="space-y-6" method="POST" onSubmit={handleSubmit}>
						<Input
							className="!border-transparent !bg-[#e9ecef] focus:ring-[#2e4a7d]"
							id="user-id"
							inputMode="numeric"
							label="ID do usuário"
							leftIcon={<User className="h-5 w-5" strokeWidth={2} />}
							name="userId"
							onChange={updateField("userId")}
							pattern="[0-9]*"
							placeholder="Ex.: 12"
							required
							type="text"
							value={form.userId}
						/>
						<p className="-mt-4 text-xs text-[#6b7280]">
							Se você acabou de criar a conta, preenchemos este ID
							automaticamente.
						</p>

						<div>
							<div className="mb-2 flex items-center justify-between">
								<label
									className="text-sm font-semibold text-gray-700"
									htmlFor="password"
								>
									Senha
								</label>
								<button
									className="text-xs font-semibold text-[#2e4a7d] hover:underline"
									type="button"
								>
									Esqueceu?
								</button>
							</div>
							<Input
								aria-label="Senha"
								className="!border-transparent !bg-[#e9ecef] focus:ring-[#2e4a7d]"
								id="password"
								leftIcon={<Lock className="h-5 w-5" strokeWidth={2} />}
								name="password"
								onChange={updateField("password")}
								placeholder="••••••••"
								required
								rightIcon={
									<PasswordVisibilityButton
										iconSize="h-4 w-4"
										isVisible={isPasswordVisible}
										onToggle={togglePasswordVisibility}
										strokeWidth={2}
									/>
								}
								type={isPasswordVisible ? "text" : "password"}
								value={form.password}
							/>
						</div>

						{mutation.isError && (
							<AuthFeedbackMessage tone="error">
								{mutation.error.message}
							</AuthFeedbackMessage>
						)}

						<Button
							className="w-full rounded-xl hover:bg-[#1e3a6d]"
							color="modern"
							disabled={mutation.isPending}
							icon={<ArrowRight className="h-5 w-5" strokeWidth={2} />}
							iconPosition="right"
							type="submit"
						>
							{mutation.isPending ? "Acessando..." : "Acessar conta"}
						</Button>
					</form>

					<div className="relative my-8">
						<div className="absolute inset-0 flex items-center">
							<span className="w-full border-t border-gray-200" />
						</div>
						<div className="relative flex justify-center text-xs uppercase">
							<span className="bg-white px-2 font-medium text-[#6b7280]">
								ou continue com
							</span>
						</div>
					</div>

					<div className="flex gap-4">
						<SocialAuthButton
							className="h-[50px] flex-1 border-gray-200 bg-gray-50 py-0 hover:bg-gray-200"
							imageAlt="Google"
							imageSrc={GOOGLE_LOGIN_ICON_URL}
						/>
						<SocialAuthButton
							className="h-[50px] flex-1 border-gray-200 bg-gray-50 py-0 hover:bg-gray-200"
							icon={
								<svg
									aria-hidden="true"
									className="h-6 w-6"
									fill="currentColor"
									viewBox="0 0 24 24"
								>
									<path d="M17.05 20.28c-.96.95-2.04 1.44-3.14 1.44-1.12 0-1.63-.42-2.94-.42-1.33 0-1.92.42-2.94.42-1.07 0-2.11-.53-3.08-1.5C3.39 18.66 2.5 16.03 2.5 13.5c0-2.55 1.02-4.59 2.6-5.52.88-.53 1.83-.81 2.8-.81 1.02 0 1.63.31 2.76.31s1.74-.31 2.76-.31c1.23 0 2.37.47 3.24 1.34-2.88 1.43-2.42 5.56.54 7.02-.63 1.55-1.48 3.1-2.15 4.25zM12.03 7.25c-.02-2.23 1.84-4.14 3.99-4.25.12 2.23-1.84 4.31-3.99 4.25z" />
								</svg>
							}
						/>
					</div>

					<div className="mt-8 text-center text-sm">
						<span className="text-[#6b7280]">Novo por aqui?</span>
						<Link
							className="ml-1 font-semibold text-[#2e4a7d] hover:underline"
							to="/"
						>
							Criar conta
						</Link>
					</div>
				</div>

				<footer className="mt-12 flex flex-wrap justify-center gap-x-12 gap-y-4 text-[10px] font-bold uppercase tracking-widest text-[#6b7280]">
					<button className="hover:text-[#2e4a7d]" type="button">
						Termos de Uso
					</button>
					<button className="hover:text-[#2e4a7d]" type="button">
						Privacidade
					</button>
					<button className="hover:text-[#2e4a7d]" type="button">
						Suporte
					</button>
				</footer>
			</section>
		</main>
	);
}
