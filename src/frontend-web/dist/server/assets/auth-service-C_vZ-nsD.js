import { jsx, jsxs } from "react/jsx-runtime";
import { tv } from "tailwind-variants";
//#region src/components/ui/Button.tsx
var button = tv({
	base: "inline-flex items-center justify-center rounded-xl transition-all not-disabled:cursor-pointer focus:outline-none gap-2 disabled:opacity-60 disabled:pointer-events-none",
	variants: {
		color: {
			primary: "bg-primary text-on-primary",
			secondary: "bg-secondary text-on-secondary",
			blueish: "bg-primary-fixed text-tertiary",
			modern: "bg-primary-container text-on-primary-container",
			transparent: "bg-transparent text-on-surface-variant"
		},
		size: {
			md: "h-11 px-6 text-label-sm font-semibold leading-[1.4]",
			lg: "h-14 px-8 text-headline-md font-bold leading-[1.2]",
			icon: "h-11 w-11 p-0 text-label-sm font-semibold leading-[1.4]"
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
		className: "mb-xs block text-label-sm font-semibold leading-[1.4] text-on-surface",
		htmlFor: id,
		children: label
	}), /* @__PURE__ */ jsxs("div", {
		className: "relative",
		children: [
			leftIcon && /* @__PURE__ */ jsx("span", {
				className: "absolute inset-y-0 left-0 flex items-center pl-md text-outline-variant",
				children: leftIcon
			}),
			/* @__PURE__ */ jsx("input", {
				className: [
					"block w-full rounded-xl border border-outline-variant bg-surface-container-lowest py-md text-body-md leading-[1.6] placeholder-outline-variant focus:border-transparent focus:ring-2 focus:ring-primary font-body-md",
					leftIcon ? "pl-lg" : "pl-md",
					rightIcon ? "pr-14" : "pr-md",
					className
				].filter(Boolean).join(" "),
				id,
				...props
			}),
			rightIcon && /* @__PURE__ */ jsx("span", {
				className: "absolute inset-y-0 right-1 flex items-center text-outline-variant",
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
		className: "fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-sm transition-all",
		style: { background: "rgba(0,0,0,0.4)" },
		children: /* @__PURE__ */ jsxs("div", {
			className: "relative flex flex-col animate-fade-in w-full mx-4 bg-surface text-on-surface rounded-xl shadow-card overflow-y-auto",
			style: {
				minWidth: "320px",
				maxWidth: "600px",
				maxHeight: "90vh",
				padding: "var(--spacing-md, 24px)",
				paddingLeft: "var(--spacing-lg, 48px)",
				paddingRight: "var(--spacing-lg, 48px)"
			},
			children: [
				/* @__PURE__ */ jsx("button", {
					"aria-label": "Fechar modal",
					className: "absolute top-3 right-3 focus:outline-none text-on-surface-variant bg-transparent rounded-full p-base transition-colors duration-180",
					onClick: onClose,
					type: "button",
					children: /* @__PURE__ */ jsx("span", {
						className: "material-symbols-outlined",
						style: { fontSize: "2rem" },
						children: "close"
					})
				}),
				title && /* @__PURE__ */ jsx("h2", {
					className: "text-headline-md font-bold leading-[1.2] mb-md text-on-surface tracking-[-0.01em]",
					children: title
				}),
				/* @__PURE__ */ jsx("div", {
					className: "flex flex-col gap-md w-full",
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
