import { Button, Input } from "#/components/ui";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Lock, Settings, User } from "lucide-react";
import { AuthFeedbackMessage } from "./components/AuthFeedbackMessage";
import { PasswordVisibilityButton } from "./components/PasswordVisibilityButton";
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
               Gestão Inteligente para Condomínios
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
