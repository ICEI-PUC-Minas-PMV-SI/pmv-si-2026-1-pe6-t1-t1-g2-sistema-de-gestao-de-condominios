import { a as getLastRegisteredUserId, c as saveAuthToken, l as saveAuthUser, m as Button, n as clearLastRegisteredUserId, o as loginUser, p as Input } from "./auth-service-DfJu0k8X.js";
import { a as PasswordVisibilityButton, i as SocialAuthButton, o as AuthFeedbackMessage, r as SOCIAL_PROOF_IMAGES, t as GOOGLE_LOGIN_ICON_URL } from "./constants-CEW880zl.js";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
import { useMutation } from "@tanstack/react-query";
import { ArrowRight, Lock, Settings, User } from "lucide-react";
//#region src/pages/auth/hooks/useLoginForm.ts
function useLoginForm() {
	const navigate = useNavigate();
	const [isPasswordVisible, setIsPasswordVisible] = useState(false);
	const [form, setForm] = useState({
		userId: "",
		password: ""
	});
	const mutation = useMutation({
		mutationFn: () => {
			const id = Number(form.userId);
			if (!Number.isInteger(id) || id <= 0) throw new Error("Informe um ID de usuário válido.");
			return loginUser({
				id,
				password: form.password
			});
		},
		onSuccess: (auth) => {
			saveAuthToken(auth.token);
			saveAuthUser(auth.user);
			clearLastRegisteredUserId();
			navigate({ to: "/deliveries" });
		}
	});
	useEffect(() => {
		const lastRegisteredUserId = getLastRegisteredUserId();
		if (lastRegisteredUserId) setForm((currentForm) => ({
			...currentForm,
			userId: lastRegisteredUserId
		}));
	}, []);
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
//#region src/pages/auth/LoginPage.tsx
function LoginPage() {
	const { form, handleSubmit, isPasswordVisible, mutation, togglePasswordVisibility, updateField } = useLoginForm();
	return /* @__PURE__ */ jsxs("main", {
		className: "flex min-h-screen flex-col overflow-hidden bg-[#f4f7f9] text-[#1f2937] [overflow-wrap:normal] lg:flex-row",
		children: [/* @__PURE__ */ jsxs("section", {
			className: "relative flex min-h-[48rem] flex-[1.2] flex-col justify-center overflow-hidden bg-[#f4f7f9] p-8 sm:p-12 lg:min-h-screen lg:p-24",
			children: [/* @__PURE__ */ jsx("div", {
				className: "absolute right-0 top-0 z-0 h-1/2 w-3/5 opacity-80",
				children: /* @__PURE__ */ jsxs("svg", {
					"aria-hidden": "true",
					className: "h-full w-full rounded-bl-[100px] bg-slate-200 object-cover",
					preserveAspectRatio: "xMidYMid slice",
					viewBox: "0 0 400 400",
					children: [
						/* @__PURE__ */ jsx("circle", {
							cx: "150",
							cy: "150",
							fill: "#fbcfe8",
							opacity: "0.9",
							r: "120"
						}),
						/* @__PURE__ */ jsx("circle", {
							cx: "280",
							cy: "220",
							fill: "#bfdbfe",
							opacity: "0.9",
							r: "140"
						}),
						/* @__PURE__ */ jsx("circle", {
							cx: "100",
							cy: "300",
							fill: "#fecdd3",
							opacity: "0.9",
							r: "80"
						}),
						/* @__PURE__ */ jsx("circle", {
							cx: "300",
							cy: "100",
							fill: "#bae6fd",
							opacity: "0.9",
							r: "60"
						})
					]
				})
			}), /* @__PURE__ */ jsxs("div", {
				className: "relative z-10 w-[min(100%,36rem)] min-w-0",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "mb-12 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm",
						children: [/* @__PURE__ */ jsx(Settings, {
							className: "h-4 w-4 text-gray-700",
							strokeWidth: 2
						}), /* @__PURE__ */ jsx("span", {
							className: "text-xs font-bold uppercase tracking-wider text-gray-700",
							children: "Modernidade Soft"
						})]
					}),
					/* @__PURE__ */ jsxs("h1", {
						className: "mb-8 text-5xl font-bold leading-tight text-[#1f2937] lg:text-7xl",
						children: [
							"Bem-vindo ",
							/* @__PURE__ */ jsx("br", {}),
							/* @__PURE__ */ jsx("span", {
								className: "text-[#2e4a7d]",
								children: "ao Modernidade."
							})
						]
					}),
					/* @__PURE__ */ jsx("p", {
						className: "mb-12 w-[min(100%,28rem)] text-lg leading-relaxed text-[#6b7280]",
						children: "Vivencie a gestão condominial como um santuário digital. Simples, fluido e projetado para a sua paz de espírito."
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "flex flex-col gap-4 sm:flex-row sm:items-center",
						children: [/* @__PURE__ */ jsx("div", {
							className: "flex",
							children: SOCIAL_PROOF_IMAGES.map((image, index) => /* @__PURE__ */ jsx("img", {
								alt: `Morador ${index + 1}`,
								className: "-ml-2 h-8 w-8 rounded-full border-2 border-white first:ml-0",
								src: image
							}, image))
						}), /* @__PURE__ */ jsx("span", {
							className: "text-sm text-[#6b7280]",
							children: "Junte-se a mais de 2.000 condomínios"
						})]
					})
				]
			})]
		}), /* @__PURE__ */ jsxs("section", {
			className: "flex flex-1 flex-col items-center justify-center px-6 py-12 sm:px-8",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "w-full max-w-[27.5rem] rounded-[40px] bg-white px-8 py-12 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.05)] sm:px-10",
				"data-purpose": "login-form-card",
				children: [
					/* @__PURE__ */ jsx("h2", {
						className: "mb-1 text-2xl font-bold text-gray-900",
						children: "Entrar na plataforma"
					}),
					/* @__PURE__ */ jsx("p", {
						className: "mb-8 text-sm text-[#6b7280]",
						children: "Insira seu ID de usuário e senha para acessar sua conta."
					}),
					/* @__PURE__ */ jsxs("form", {
						className: "space-y-6",
						method: "POST",
						onSubmit: handleSubmit,
						children: [
							/* @__PURE__ */ jsx(Input, {
								className: "!border-transparent !bg-[#e9ecef] focus:ring-[#2e4a7d]",
								id: "user-id",
								inputMode: "numeric",
								label: "ID do usuário",
								leftIcon: /* @__PURE__ */ jsx(User, {
									className: "h-5 w-5",
									strokeWidth: 2
								}),
								name: "userId",
								onChange: updateField("userId"),
								pattern: "[0-9]*",
								placeholder: "Ex.: 12",
								required: true,
								type: "text",
								value: form.userId
							}),
							/* @__PURE__ */ jsx("p", {
								className: "-mt-4 text-xs text-[#6b7280]",
								children: "Se você acabou de criar a conta, preenchemos este ID automaticamente."
							}),
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("div", {
								className: "mb-2 flex items-center justify-between",
								children: [/* @__PURE__ */ jsx("label", {
									className: "text-sm font-semibold text-gray-700",
									htmlFor: "password",
									children: "Senha"
								}), /* @__PURE__ */ jsx("button", {
									className: "text-xs font-semibold text-[#2e4a7d] hover:underline",
									type: "button",
									children: "Esqueceu?"
								})]
							}), /* @__PURE__ */ jsx(Input, {
								"aria-label": "Senha",
								className: "!border-transparent !bg-[#e9ecef] focus:ring-[#2e4a7d]",
								id: "password",
								leftIcon: /* @__PURE__ */ jsx(Lock, {
									className: "h-5 w-5",
									strokeWidth: 2
								}),
								name: "password",
								onChange: updateField("password"),
								placeholder: "••••••••",
								required: true,
								rightIcon: /* @__PURE__ */ jsx(PasswordVisibilityButton, {
									iconSize: "h-4 w-4",
									isVisible: isPasswordVisible,
									onToggle: togglePasswordVisibility,
									strokeWidth: 2
								}),
								type: isPasswordVisible ? "text" : "password",
								value: form.password
							})] }),
							mutation.isError && /* @__PURE__ */ jsx(AuthFeedbackMessage, {
								tone: "error",
								children: mutation.error.message
							}),
							/* @__PURE__ */ jsx(Button, {
								className: "w-full rounded-xl hover:bg-[#1e3a6d]",
								color: "modern",
								disabled: mutation.isPending,
								icon: /* @__PURE__ */ jsx(ArrowRight, {
									className: "h-5 w-5",
									strokeWidth: 2
								}),
								iconPosition: "right",
								type: "submit",
								children: mutation.isPending ? "Acessando..." : "Acessar conta"
							})
						]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "relative my-8",
						children: [/* @__PURE__ */ jsx("div", {
							className: "absolute inset-0 flex items-center",
							children: /* @__PURE__ */ jsx("span", { className: "w-full border-t border-gray-200" })
						}), /* @__PURE__ */ jsx("div", {
							className: "relative flex justify-center text-xs uppercase",
							children: /* @__PURE__ */ jsx("span", {
								className: "bg-white px-2 font-medium text-[#6b7280]",
								children: "ou continue com"
							})
						})]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "flex gap-4",
						children: [/* @__PURE__ */ jsx(SocialAuthButton, {
							className: "h-[50px] flex-1 border-gray-200 bg-gray-50 py-0 hover:bg-gray-200",
							imageAlt: "Google",
							imageSrc: GOOGLE_LOGIN_ICON_URL
						}), /* @__PURE__ */ jsx(SocialAuthButton, {
							className: "h-[50px] flex-1 border-gray-200 bg-gray-50 py-0 hover:bg-gray-200",
							icon: /* @__PURE__ */ jsx("svg", {
								"aria-hidden": "true",
								className: "h-6 w-6",
								fill: "currentColor",
								viewBox: "0 0 24 24",
								children: /* @__PURE__ */ jsx("path", { d: "M17.05 20.28c-.96.95-2.04 1.44-3.14 1.44-1.12 0-1.63-.42-2.94-.42-1.33 0-1.92.42-2.94.42-1.07 0-2.11-.53-3.08-1.5C3.39 18.66 2.5 16.03 2.5 13.5c0-2.55 1.02-4.59 2.6-5.52.88-.53 1.83-.81 2.8-.81 1.02 0 1.63.31 2.76.31s1.74-.31 2.76-.31c1.23 0 2.37.47 3.24 1.34-2.88 1.43-2.42 5.56.54 7.02-.63 1.55-1.48 3.1-2.15 4.25zM12.03 7.25c-.02-2.23 1.84-4.14 3.99-4.25.12 2.23-1.84 4.31-3.99 4.25z" })
							})
						})]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "mt-8 text-center text-sm",
						children: [/* @__PURE__ */ jsx("span", {
							className: "text-[#6b7280]",
							children: "Novo por aqui?"
						}), /* @__PURE__ */ jsx(Link, {
							className: "ml-1 font-semibold text-[#2e4a7d] hover:underline",
							to: "/",
							children: "Criar conta"
						})]
					})
				]
			}), /* @__PURE__ */ jsxs("footer", {
				className: "mt-12 flex flex-wrap justify-center gap-x-12 gap-y-4 text-[10px] font-bold uppercase tracking-widest text-[#6b7280]",
				children: [
					/* @__PURE__ */ jsx("button", {
						className: "hover:text-[#2e4a7d]",
						type: "button",
						children: "Termos de Uso"
					}),
					/* @__PURE__ */ jsx("button", {
						className: "hover:text-[#2e4a7d]",
						type: "button",
						children: "Privacidade"
					}),
					/* @__PURE__ */ jsx("button", {
						className: "hover:text-[#2e4a7d]",
						type: "button",
						children: "Suporte"
					})
				]
			})]
		})]
	});
}
//#endregion
//#region src/routes/login.tsx?tsr-split=component
var SplitComponent = LoginPage;
//#endregion
export { SplitComponent as component };
