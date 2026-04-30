import { m as Button, p as Input, s as registerUser, u as saveLastRegisteredUserId } from "./auth-service-DfJu0k8X.js";
import { a as PasswordVisibilityButton, i as SocialAuthButton, n as GOOGLE_REGISTER_ICON_URL, o as AuthFeedbackMessage } from "./constants-CEW880zl.js";
import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
import { useMutation } from "@tanstack/react-query";
import { Building2, Cloud, Lock, Mail, ShieldCheck, User } from "lucide-react";
//#region src/pages/auth/components/AuthDivider.tsx
function AuthDivider({ label }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "relative my-7",
		children: [/* @__PURE__ */ jsx("div", {
			className: "absolute inset-0 flex items-center",
			children: /* @__PURE__ */ jsx("span", { className: "w-full border-t border-gray-200" })
		}), /* @__PURE__ */ jsx("div", {
			className: "relative flex justify-center text-[10px] uppercase",
			children: /* @__PURE__ */ jsx("span", {
				className: "bg-white px-3 text-gray-400 tracking-wider",
				children: label
			})
		})]
	});
}
//#endregion
//#region src/pages/auth/hooks/useRegisterForm.ts
function useRegisterForm() {
	const navigate = useNavigate();
	const [isPasswordVisible, setIsPasswordVisible] = useState(false);
	const [form, setForm] = useState({
		username: "",
		email: "",
		password: ""
	});
	const mutation = useMutation({
		mutationFn: () => registerUser(form),
		onSuccess: (user) => {
			saveLastRegisteredUserId(user.id);
			navigate({ to: "/login" });
		}
	});
	function updateField(field) {
		return (event) => {
			setForm((currentForm) => ({
				...currentForm,
				[field]: event.target.value
			}));
		};
	}
	function handleSubmit(event) {
		event.preventDefault();
		mutation.mutate();
	}
	function togglePasswordVisibility() {
		setIsPasswordVisible((currentVisibility) => !currentVisibility);
	}
	return {
		form,
		handleSubmit,
		isPasswordVisible,
		mutation,
		togglePasswordVisibility,
		updateField
	};
}
//#endregion
//#region src/pages/auth/RegisterPage.tsx
function RegisterPage() {
	const { form, handleSubmit, isPasswordVisible, mutation, togglePasswordVisibility, updateField } = useRegisterForm();
	return /* @__PURE__ */ jsxs("div", {
		className: "flex min-h-screen w-full flex-col items-stretch overflow-x-hidden bg-[#f6fafd] [overflow-wrap:normal] md:flex-row",
		children: [/* @__PURE__ */ jsxs("section", {
			className: "relative flex min-h-screen w-full min-w-0 flex-col justify-start overflow-hidden bg-[#eaf4fe] p-8 md:min-h-0 md:basis-1/2 md:p-16 lg:p-24",
			children: [/* @__PURE__ */ jsx("div", {
				className: "z-10",
				style: { minHeight: "60px" },
				children: /* @__PURE__ */ jsx("h1", {
					className: "text-[20px] font-bold tracking-tight text-[#1e293b] mb-12",
					children: "Modernidade"
				})
			}), /* @__PURE__ */ jsxs("div", {
				className: "z-10 mx-auto flex w-[min(100%,32rem)] min-w-0 flex-1 flex-col justify-center pt-8",
				children: [
					/* @__PURE__ */ jsx("span", {
						className: "mb-6 inline-block self-start whitespace-nowrap rounded-full border border-blue-100 bg-white px-5 py-1.5 text-[13px] font-bold uppercase tracking-widest text-[#2563eb] shadow-sm",
						children: "GESTÃO INTELIGENTE"
					}),
					/* @__PURE__ */ jsxs("h2", {
						className: "text-5xl md:text-6xl font-extrabold leading-[1.1] text-[#111827] mb-6",
						children: [
							"Bem-vindo ao",
							/* @__PURE__ */ jsx("br", {}),
							"Modernidade"
						]
					}),
					/* @__PURE__ */ jsx("p", {
						className: "text-base text-[#334155] leading-relaxed mb-10 max-w-[28rem] w-full",
						children: "A plataforma definitiva para elevar a gestão condominial a um novo patamar de eficiência, transparência e tranquilidade digital."
					}),
					/* @__PURE__ */ jsx("div", {
						className: "flex gap-8 justify-center mt-2",
						children: [
							/* @__PURE__ */ jsx(Building2, { className: "h-8 w-8 text-[#2563eb]" }, "building"),
							/* @__PURE__ */ jsx(ShieldCheck, { className: "h-8 w-8 text-[#2563eb]" }, "shield"),
							/* @__PURE__ */ jsx(Cloud, { className: "h-8 w-8 text-[#2563eb]" }, "cloud")
						].map((icon) => /* @__PURE__ */ jsx("div", {
							className: "w-16 h-16 bg-white rounded-2xl shadow-md flex items-center justify-center border border-[#eaf4fe]",
							children: icon
						}, icon.key))
					})
				]
			})]
		}), /* @__PURE__ */ jsxs("main", {
			className: "relative flex min-h-screen w-full min-w-0 flex-col items-center justify-center bg-white p-8 md:min-h-0 md:basis-1/2 lg:p-12",
			children: [/* @__PURE__ */ jsx("div", {
				className: "flex justify-end w-full max-w-[42rem] mx-auto mb-8 md:absolute md:top-10 md:right-10",
				children: /* @__PURE__ */ jsx(Link, {
					className: "rounded-lg border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 shadow-none transition-colors hover:bg-gray-50",
					to: "/login",
					children: "Entrar"
				})
			}), /* @__PURE__ */ jsx("div", {
				className: "flex min-w-0 flex-1 items-center justify-center w-full h-full",
				children: /* @__PURE__ */ jsxs("div", {
					className: "flex w-[min(100%,28rem)] min-w-0 flex-col rounded-[32px] border border-gray-100 bg-white p-10 shadow-[0_4px_32px_0_rgba(16,30,54,0.08)]",
					"data-purpose": "registration-card",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "mb-6",
							children: [/* @__PURE__ */ jsx("h2", {
								className: "text-2xl font-extrabold text-[#111827] mb-1",
								children: "Criar sua conta"
							}), /* @__PURE__ */ jsx("p", {
								className: "text-gray-500 text-base",
								children: "Comece sua jornada hoje mesmo."
							})]
						}),
						/* @__PURE__ */ jsxs("form", {
							className: "space-y-5",
							onSubmit: handleSubmit,
							children: [
								/* @__PURE__ */ jsx(Input, {
									id: "name",
									label: "Nome Completo",
									leftIcon: /* @__PURE__ */ jsx(User, {
										className: "h-5 w-5",
										strokeWidth: 1.5
									}),
									name: "name",
									onChange: updateField("username"),
									placeholder: "Seu nome",
									required: true,
									type: "text",
									value: form.username
								}),
								/* @__PURE__ */ jsx(Input, {
									id: "email",
									label: "E-mail",
									leftIcon: /* @__PURE__ */ jsx(Mail, {
										className: "h-5 w-5",
										strokeWidth: 1.5
									}),
									name: "email",
									onChange: updateField("email"),
									placeholder: "email@exemplo.com",
									required: true,
									type: "email",
									value: form.email
								}),
								/* @__PURE__ */ jsx(Input, {
									id: "password",
									label: "Senha",
									leftIcon: /* @__PURE__ */ jsx(Lock, {
										className: "h-5 w-5",
										strokeWidth: 1.5
									}),
									name: "password",
									onChange: updateField("password"),
									placeholder: "••••••••",
									required: true,
									rightIcon: /* @__PURE__ */ jsx(PasswordVisibilityButton, {
										isVisible: isPasswordVisible,
										onToggle: togglePasswordVisibility
									}),
									type: isPasswordVisible ? "text" : "password",
									value: form.password
								}),
								mutation.isError && /* @__PURE__ */ jsx(AuthFeedbackMessage, {
									tone: "error",
									children: mutation.error.message
								}),
								mutation.isSuccess && /* @__PURE__ */ jsx(AuthFeedbackMessage, {
									tone: "success",
									children: "Conta criada com sucesso."
								}),
								/* @__PURE__ */ jsxs(Button, {
									color: "blueish",
									className: "w-full",
									disabled: mutation.isPending,
									type: "submit",
									children: [mutation.isPending ? "Criando conta..." : "Criar conta", /* @__PURE__ */ jsx("span", {
										className: "material-symbols-outlined text-2xl",
										children: "arrow_forward"
									})]
								})
							]
						}),
						/* @__PURE__ */ jsx(AuthDivider, { label: "ou cadastre-se com" }),
						/* @__PURE__ */ jsxs("div", {
							className: "grid grid-cols-2 gap-4",
							children: [/* @__PURE__ */ jsx(SocialAuthButton, {
								imageAlt: "Google",
								imageSrc: GOOGLE_REGISTER_ICON_URL,
								children: /* @__PURE__ */ jsx("span", {
									className: "text-sm font-semibold text-gray-700",
									children: "Google"
								})
							}), /* @__PURE__ */ jsx(SocialAuthButton, {
								icon: /* @__PURE__ */ jsx("svg", {
									"aria-hidden": "true",
									className: "w-5 h-5",
									fill: "currentColor",
									viewBox: "0 0 384 512",
									children: /* @__PURE__ */ jsx("path", { d: "M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" })
								}),
								children: /* @__PURE__ */ jsx("span", {
									className: "text-sm font-semibold text-gray-700",
									children: "Apple"
								})
							})]
						}),
						/* @__PURE__ */ jsxs("p", {
							className: "text-center mt-8 text-sm text-gray-500",
							children: [
								"Já tem uma conta?",
								" ",
								/* @__PURE__ */ jsx(Link, {
									className: "text-gray-900 font-semibold hover:underline",
									to: "/login",
									children: "Entre aqui"
								})
							]
						})
					]
				})
			})]
		})]
	});
}
//#endregion
//#region src/routes/index.tsx?tsr-split=component
var SplitComponent = RegisterPage;
//#endregion
export { SplitComponent as component };
