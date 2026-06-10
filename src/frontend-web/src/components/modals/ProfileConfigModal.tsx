import { ArrowRight, Pencil, Settings, User, X } from "lucide-react";
import { Button, Input } from "#/components/ui";
import type { AuthUser } from "#/types/auth";
import { updateUserProfile } from "#/services/auth-service";
import { useState, useEffect } from "react";

type ProfileConfigModalProps = {
  authUser: AuthUser | null;
  isOpen: boolean;
  onClose: () => void;
};

function isAdmin(profile: string | null): boolean {
  return profile?.toLowerCase() === "administrador";
}

export function ProfileConfigModal({
  authUser,
  isOpen,
  onClose,
}: ProfileConfigModalProps) {
  const [formData, setFormData] = useState({
    username: authUser?.username ?? "",
    email: authUser?.email ?? "",
    profile: authUser?.profile ?? "",
  });
  const [_isPending, setIsPending] = useState(false);
  const [_errorMessage, setErrorMessage] = useState<string | null>(null);
  const [_successMessage, setSuccessMessage] = useState<string | null>(null);

  const userIsAdmin = isAdmin(authUser?.profile ?? null);

  useEffect(() => {
    if (isOpen && authUser) {
      setFormData({
        username: authUser.username ?? "",
        email: authUser.email ?? "",
        profile: authUser.profile ?? "",
      });
    }
  }, [authUser, isOpen]);

  if (!isOpen) return null;

  function handleOverlayKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape" || e.key === "Enter" || e.key === " ") {
      onClose();
    }
  }

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsPending(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const payload: Parameters<typeof updateUserProfile>[0] = {};
      if (formData.username !== (authUser?.username ?? "")) {
        payload.username = formData.username;
      }
      if (formData.email !== (authUser?.email ?? "")) {
        payload.email = formData.email;
      }
      if (userIsAdmin && formData.profile !== (authUser?.profile ?? "")) {
        payload.profile = formData.profile;
      }

      if (Object.keys(payload).length === 0) {
        setSuccessMessage("Nenhuma alteração detectada.");
        setIsPending(false);
        return;
      }

      await updateUserProfile(payload);
      setSuccessMessage("Perfil atualizado com sucesso!");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Erro ao atualizar perfil.",
      );
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        aria-label="Fechar modal"
        className="absolute inset-0 bg-background/80 backdrop-blur-xl cursor-pointer"
        onClick={onClose}
        onKeyDown={handleOverlayKeyDown}
        type="button"
      />
      <main
        className="relative flex w-full max-w-[calc(100vw-2rem)] max-h-[90vh] flex-col overflow-y-auto rounded-[32px] bg-white shadow-2xl animate-in fade-in zoom-in duration-300 md:max-w-4xl"
        data-purpose="settings-modal-container"
      >
        {/* Header */}
        <header className="flex items-center justify-between border-b border-gray-100 px-6 pb-4 pt-6 md:px-8 md:pt-8">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-[#2e4a7d] rounded-xl text-white">
              <Settings className="h-6 w-6" strokeWidth={2} />
            </div>
            <h1 className="text-2xl font-semibold text-slate-800">
              Configurações
            </h1>
          </div>
          <button
            className="text-gray-400 hover:text-gray-600 transition-colors"
            onClick={onClose}
            type="button"
          >
            <X className="h-6 w-6" strokeWidth={2} />
          </button>
        </header>

        {/* Content Area */}
        <div className="flex min-h-[500px] flex-1 flex-col md:flex-row">
          {/* Modal Sidebar */}
          <aside
            className="flex flex-col gap-2 border-b border-gray-100 p-4 md:w-64 md:border-b-0 md:border-r md:p-6"
            data-purpose="modal-sidebar"
          >
            <nav>
              <button
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#f8fafc] text-[#2e4a7d] font-medium text-sm transition-all w-full text-left"
                type="button"
              >
                <User className="h-5 w-5" strokeWidth={2} />
                Perfil
              </button>
            </nav>
          </aside>

          {/* Main Content */}
          <section className="flex-1 p-6 md:p-10" data-purpose="profile-content">
            <header className="mb-8">
              <h2 className="text-xl font-bold text-slate-800">
                Informações do Perfil
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                Gerencie suas informações pessoais.
              </p>
            </header>

            {/* Profile Photo Placeholder */}
            <div className="flex items-center gap-6 mb-10">
              <div className="relative">
                <div className="w-24 h-24 rounded-3xl bg-[#eaedf2] flex items-center justify-center border border-gray-100 shadow-sm">
                  <User className="h-10 w-10 text-[#6b7280]" strokeWidth={2} />
                </div>
                <button
                  className="absolute -bottom-2 -right-2 bg-white p-1.5 rounded-full shadow-md border border-gray-100 hover:bg-gray-50 transition-colors"
                  type="button"
                >
                  <Pencil className="h-4 w-4 text-slate-600" strokeWidth={2} />
                </button>
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">Foto de Perfil</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  PNG ou JPG até 10MB.
                </p>
              </div>
            </div>

            {/* Profile Form */}
            <form
              id="profile-edit-form"
              className="space-y-6"
              data-purpose="profile-edit-form"
              onSubmit={handleSubmit}
            >
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label
                    className="block text-sm font-semibold text-slate-600 ml-1"
                    htmlFor="username"
                  >
                    Nome de Usuário
                  </label>
                  <Input
                    className="!border-none !bg-[#eaedf2] rounded-2xl px-5 py-4 text-slate-800 focus:ring-2 focus:ring-[#2e4a7d]"
                    id="username"
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <label
                    className="block text-sm font-semibold text-slate-600 ml-1"
                    htmlFor="email"
                  >
                    E-mail Corporativo
                  </label>
                  <Input
                    className="!border-none !bg-[#eaedf2] rounded-2xl px-5 py-4 text-slate-800 focus:ring-2 focus:ring-[#2e4a7d]"
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label
                  className="block text-sm font-semibold text-slate-600 ml-1"
                  htmlFor="profile"
                >
                  Perfil / Função
                </label>
                {userIsAdmin ? (
                  <select
                    id="profile"
                    name="profile"
                    value={formData.profile}
                    onChange={handleChange}
                    className="!border-none !bg-[#eaedf2] rounded-2xl px-5 py-4 text-slate-800 focus:ring-2 focus:ring-[#2e4a7d] w-full"
                  >
                    <option value="morador">Morador</option>
                    <option value="administrador">Administrador</option>
                  </select>
                ) : (
                  <div className="!border-none !bg-[#eaedf2] rounded-2xl px-5 py-4 text-slate-800">
                    {formData.profile || "-"}
                    <span className="ml-2 text-xs text-slate-400 italic">
                      (Apenas administradores podem alterar)
                    </span>
                  </div>
                )}
              </div>
            </form>
          </section>
        </div>

        {/* Footer */}
        <footer className="flex items-center justify-end gap-4 bg-gray-50/30 px-6 py-6 md:gap-6 md:px-8">
          <button
            className="text-slate-500 font-medium hover:text-slate-800 transition-colors"
            onClick={onClose}
            type="button"
          >
            Cancelar
          </button>
          <Button
            className="bg-[#2e4a7d] hover:bg-[#1e3a6d] text-white px-8 py-3.5 rounded-2xl font-medium flex items-center gap-3 shadow-lg shadow-blue-900/10 transition-all active:scale-95"
            type="submit"
            form="profile-edit-form"
          >
            Salvar Alterações
            <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </Button>
        </footer>
      </main>
    </div>
  );
}
