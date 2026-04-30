import { jsx, jsxs } from "react/jsx-runtime";
import { tv } from "tailwind-variants";
//#region src/components/ui/Button.tsx
var button = tv({
	base: "inline-flex items-center justify-center hover:opacity-50 transition-all! not-disabled:cursor-pointer font-label-sm font-semibold font-manrope focus:outline-none rounded-lg gap-2 disabled:opacity-60 disabled:pointer-events-none",
	variants: {
		color: {
			primary: "bg-primary text-on-primary!",
			secondary: "bg-secondary/10 text-surface-tint!",
			blueish: "bg-on-primary-fixed text-on-tertiary!",
			modern: "bg-[#2e4a7d] text-white!",
			transparent: "bg-transparent text-on-surface-variant!"
		},
		size: {
			md: "h-11 px-6 text-[--font-label-sm]",
			lg: "h-14 px-8 text-[--font-headline-md]",
			icon: "h-11 w-11 p-0 text-[--font-label-sm]"
		}
	},
	defaultVariants: {
		color: "primary",
		size: "md"
	}
});
function Button({ color, size, icon, iconPosition = "left", children, className = "", ...props }) {
	return /* @__PURE__ */ jsxs("button", {
		className: button({
			color,
			size,
			className
		}),
		...props,
		children: [
			icon && iconPosition === "left" && /* @__PURE__ */ jsx("span", {
				className: "flex items-center",
				children: icon
			}),
			children,
			icon && iconPosition === "right" && /* @__PURE__ */ jsx("span", {
				className: "flex items-center",
				children: icon
			})
		]
	});
}
//#endregion
//#region src/components/ui/Input.tsx
function Input({ id, label, leftIcon, rightIcon, className = "", ...props }) {
	return /* @__PURE__ */ jsxs("div", { children: [label && /* @__PURE__ */ jsx("label", {
		className: "mb-1.5 block text-sm font-semibold text-gray-700",
		htmlFor: id,
		children: label
	}), /* @__PURE__ */ jsxs("div", {
		className: "relative",
		children: [
			leftIcon && /* @__PURE__ */ jsx("span", {
				className: "absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400",
				children: leftIcon
			}),
			/* @__PURE__ */ jsx("input", {
				className: [
					"block w-full rounded-xl border border-gray-200 bg-white py-3 text-sm placeholder-gray-300 focus:border-transparent focus:ring-2 focus:ring-[#2563eb]",
					leftIcon ? "pl-10" : "pl-3",
					rightIcon ? "pr-14" : "pr-3",
					className
				].filter(Boolean).join(" "),
				id,
				...props
			}),
			rightIcon && /* @__PURE__ */ jsx("span", {
				className: "absolute inset-y-0 right-1 flex items-center text-gray-400",
				children: rightIcon
			})
		]
	})] });
}
//#endregion
//#region src/components/ui/Modal.tsx
function Modal({ open, onClose, title, children }) {
	if (!open) return null;
	return /* @__PURE__ */ jsx("div", {
		className: "fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm transition-all",
		children: /* @__PURE__ */ jsxs("div", {
			className: "bg-surface text-on-surface rounded-xl shadow-2xl w-full max-w-2xl sm:max-w-xl mx-4 p-6 md:p-10 relative flex flex-col animate-fade-in",
			style: {
				minWidth: "320px",
				maxWidth: "600px",
				maxHeight: "90vh",
				overflowY: "auto"
			},
			children: [
				/* @__PURE__ */ jsx("button", {
					"aria-label": "Fechar modal",
					className: "absolute top-3 right-3 text-on-surface-variant hover:text-error transition-colors p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/30",
					onClick: onClose,
					type: "button",
					children: /* @__PURE__ */ jsx("span", {
						className: "material-symbols-outlined text-2xl",
						children: "close"
					})
				}),
				title && /* @__PURE__ */ jsx("h2", {
					className: "text-headline-md font-headline-md mb-6 text-on-surface font-bold tracking-tight",
					children: title
				}),
				/* @__PURE__ */ jsx("div", {
					className: "flex flex-col gap-4 w-full",
					children
				})
			]
		})
	});
}
//#endregion
//#region src/constants/storage.ts
var AUTH_TOKEN_KEY = "modernidade.auth.token";
var AUTH_USER_KEY = "modernidade.auth.user";
var LAST_REGISTERED_USER_ID_KEY = "modernidade.auth.lastRegisteredUserId";
//#endregion
//#region src/services/api-client.ts
var API_BASE_URL = "http://localhost:5219"?.replace(/\/$/, "") ?? "";
var DEFAULT_ERROR_MESSAGE = "Não foi possível concluir a solicitação.";
async function readApiError(response) {
	if ((response.headers.get("content-type") ?? "").includes("application/json")) {
		const payload = await response.json().catch(() => null);
		if (payload?.errors) {
			const firstError = Object.values(payload.errors).flat()[0];
			if (firstError) return firstError;
		}
		return payload?.message ?? payload?.detail ?? payload?.title ?? DEFAULT_ERROR_MESSAGE;
	}
	return await response.text().catch(() => "") || DEFAULT_ERROR_MESSAGE;
}
async function apiRequest(path, options = {}) {
	const response = await fetch(`${API_BASE_URL}${path}`, {
		...options,
		headers: {
			"Content-Type": "application/json",
			...options.headers
		}
	});
	if (!response.ok) throw new Error(await readApiError(response));
	if (response.status === 204) return;
	return response.json();
}
//#endregion
//#region src/services/auth-service.ts
var ROLE_CLAIM = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";
var NAME_ID_CLAIM = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier";
var NAME_CLAIM = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name";
var EMAIL_CLAIM = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress";
function readTokenPayload(token) {
	try {
		const [, payload] = token.split(".");
		if (!payload) return null;
		const padded = payload.replace(/-/g, "+").replace(/_/g, "/").padEnd(payload.length + (4 - payload.length % 4) % 4, "=");
		return JSON.parse(atob(padded));
	} catch {
		return null;
	}
}
function readProfileFromToken(token) {
	const data = readTokenPayload(token);
	const role = data?.[ROLE_CLAIM] ?? data?.role;
	return typeof role === "string" ? role : null;
}
function normalizeAuthUser(rawUser, token, fallbackId) {
	const id = Number(rawUser?.id ?? rawUser?.Id ?? fallbackId);
	if (!Number.isInteger(id) || id <= 0) return null;
	return {
		id,
		username: rawUser?.username ?? rawUser?.Username ?? null,
		email: rawUser?.email ?? rawUser?.Email ?? null,
		profile: rawUser?.profile ?? rawUser?.Profile ?? readProfileFromToken(token)
	};
}
async function registerUser(payload) {
	return apiRequest("/api/Users", {
		method: "POST",
		body: JSON.stringify({
			username: payload.username,
			email: payload.email,
			password_hash: payload.password,
			profile: "Morador"
		})
	});
}
async function loginUser(payload) {
	const response = await apiRequest("/api/Users/auth", {
		method: "POST",
		body: JSON.stringify(payload)
	});
	const token = response.token ?? response.Token;
	if (!token) throw new Error("O backend não retornou um token de autenticação.");
	return {
		token,
		user: normalizeAuthUser(response.user ?? response.User, token, payload.id)
	};
}
function saveAuthToken(token) {
	if (typeof window === "undefined") return;
	window.localStorage.setItem(AUTH_TOKEN_KEY, token);
}
function getAuthToken() {
	if (typeof window === "undefined") return null;
	return window.localStorage.getItem(AUTH_TOKEN_KEY);
}
function clearAuthSession() {
	if (typeof window === "undefined") return;
	window.localStorage.removeItem(AUTH_TOKEN_KEY);
	window.localStorage.removeItem(AUTH_USER_KEY);
	window.sessionStorage.removeItem(LAST_REGISTERED_USER_ID_KEY);
}
function saveAuthUser(user) {
	if (!user || typeof window === "undefined") return;
	window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}
function getAuthUser() {
	if (typeof window === "undefined") return null;
	const storedUser = window.localStorage.getItem(AUTH_USER_KEY);
	const token = window.localStorage.getItem(AUTH_TOKEN_KEY);
	if (storedUser) try {
		const user = JSON.parse(storedUser);
		return user.profile || !token ? user : {
			...user,
			profile: readProfileFromToken(token)
		};
	} catch {
		return null;
	}
	if (!token) return null;
	const data = readTokenPayload(token);
	const id = Number(data?.[NAME_ID_CLAIM] ?? data?.nameid);
	if (!Number.isInteger(id) || id <= 0) return null;
	return {
		id,
		username: data?.[NAME_CLAIM] ?? data?.unique_name ?? null,
		email: data?.[EMAIL_CLAIM] ?? data?.email ?? null,
		profile: readProfileFromToken(token)
	};
}
function saveLastRegisteredUserId(userId) {
	if (typeof window === "undefined") return;
	window.sessionStorage.setItem(LAST_REGISTERED_USER_ID_KEY, String(userId));
}
function getLastRegisteredUserId() {
	if (typeof window === "undefined") return null;
	return window.sessionStorage.getItem(LAST_REGISTERED_USER_ID_KEY);
}
function clearLastRegisteredUserId() {
	if (typeof window === "undefined") return;
	window.sessionStorage.removeItem(LAST_REGISTERED_USER_ID_KEY);
}
//#endregion
export { getLastRegisteredUserId as a, saveAuthToken as c, apiRequest as d, Modal as f, getAuthUser as i, saveAuthUser as l, Button as m, clearLastRegisteredUserId as n, loginUser as o, Input as p, getAuthToken as r, registerUser as s, clearAuthSession as t, saveLastRegisteredUserId as u };
