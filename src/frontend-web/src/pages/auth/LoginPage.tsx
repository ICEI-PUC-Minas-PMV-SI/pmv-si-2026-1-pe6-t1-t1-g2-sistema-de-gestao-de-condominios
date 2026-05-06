import { Button, Input } from "#/components/ui";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Lock, Settings, User } from "lucide-react";
import { AuthFeedbackMessage } from "./components/AuthFeedbackMessage";
import { PasswordVisibilityButton } from "./components/PasswordVisibilityButton";
import { SocialAuthButton } from "./components/SocialAuthButton";
import { SOCIAL_PROOF_IMAGES } from "./constants";
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
    <main
      className="flex min-h-screen flex-col overflow-hidden [overflow-wrap:normal] lg:flex-row"
      style={{
        background: "var(--color-background)",
        color: "var(--color-on-background)",
      }}
    >
      <section
        className="relative flex min-h-[48rem] flex-[1.2] flex-col justify-center overflow-hidden p-8 sm:p-12 lg:min-h-screen lg:p-24"
        style={{ background: "var(--color-background)" }}
      >
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
          <div
            className="mb-12 inline-flex items-center gap-2 rounded-full px-4 py-2 shadow-sm"
            style={{ background: "var(--color-surface-container-lowest)" }}
          >
            <Settings
              className="h-4 w-4"
              style={{ color: "var(--color-on-surface)" }}
              strokeWidth={2}
            />
            <span
              className="text-xs font-bold uppercase tracking-wider"
              style={{ color: "var(--color-on-surface)" }}
            >
              Modernidade Soft
            </span>
          </div>

          <h1 className="mb-8 text-5xl font-bold leading-tight text-[#1f2937] lg:text-7xl">
            Bem-vindo ao
            <br />
            <span className="text-[#2e4a7d]">Gestão de Condomínios</span>
          </h1>

          <p
            className="mb-12 w-[min(100%,28rem)] text-lg leading-relaxed"
            style={{ color: "var(--color-on-surface-variant)" }}
          >
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
            <span
              className="text-sm"
              style={{ color: "var(--color-on-surface-variant)" }}
            >
              Junte-se a mais de 2.000 condomínios
            </span>
          </div>
        </div>
      </section>

      <section className="flex flex-1 flex-col items-center justify-center px-6 py-12 sm:px-8">
        <div
          className="w-full max-w-[27.5rem] px-8 py-12 sm:px-10"
          data-purpose="login-form-card"
          style={{
            background: "var(--color-surface-container-lowest)",
            borderRadius: "40px",
            boxShadow: "0 25px 50px -12px rgba(0,0,0,0.05)",
          }}
        >
          <h2
            className="mb-1 text-2xl font-bold"
            style={{ color: "var(--color-on-surface)" }}
          >
            Entrar na plataforma
          </h2>
          <p
            className="mb-8 text-sm"
            style={{ color: "var(--color-on-surface-variant)" }}
          >
            Insira seu e-mail e senha para acessar sua conta.
          </p>

          <form className="space-y-6" method="POST" onSubmit={handleSubmit}>
            <Input
              id="email"
              label="E-mail"
              leftIcon={<User className="h-5 w-5" strokeWidth={2} />}
              name="email"
              onChange={updateField("email")}
              placeholder="email@exemplo.com"
              required
              type="email"
              value={form.email}
            />

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label
                  className="text-sm font-semibold"
                  htmlFor="password"
                  style={{ color: "var(--color-on-surface)" }}
                >
                  Senha
                </label>
                <button
                  className="text-xs font-semibold hover:underline"
                  style={{ color: "var(--color-primary)" }}
                  type="button"
                >
                  Esqueceu?
                </button>
              </div>
              <Input
                aria-label="Senha"
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
              className="w-full rounded-xl"
              color="primary"
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
              <span
                className="w-full border-t"
                style={{ borderColor: "var(--color-outline)" }}
              />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span
                className="px-2 font-medium"
                style={{
                  background: "var(--color-surface-container-lowest)",
                  color: "var(--color-on-surface-variant)",
                }}
              >
                ou continue com
              </span>
            </div>
          </div>

          <div className="flex gap-4">
            <SocialAuthButton
              provider="google"
              className="h-[50px] flex-1 py-0 border-[var(--color-outline)]"
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
              className="h-[50px] flex-1 py-0 border-[var(--color-outline)]"
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
            <span style={{ color: "var(--color-on-surface-variant)" }}>
              Novo por aqui?
            </span>
            <Link
              className="ml-1 font-semibold hover:underline"
              style={{ color: "var(--color-primary)" }}
              to="/"
            >
              Criar conta
            </Link>
          </div>
        </div>

        <footer
          className="mt-12 flex flex-wrap justify-center gap-x-12 gap-y-4 text-[10px] font-bold uppercase tracking-widest"
          style={{ color: "var(--color-on-surface-variant)" }}
        >
          <button
            className="hover:underline"
            style={{ color: "var(--color-primary)" }}
            type="button"
          >
            Termos de Uso
          </button>
          <button
            className="hover:underline"
            style={{ color: "var(--color-primary)" }}
            type="button"
          >
            Privacidade
          </button>
          <button
            className="hover:underline"
            style={{ color: "var(--color-primary)" }}
            type="button"
          >
            Suporte
          </button>
        </footer>
      </section>
    </main>
  );
}
