import {
	AUTH_TOKEN_KEY,
	AUTH_USER_KEY,
} from "#/constants/storage";
import type {
	AuthResult,
	AuthUser,
	LoginPayload,
	RegisterPayload,
} from "#/types/auth";
import { apiRequest } from "./api-client";

const ROLE_CLAIM =
	"http://schemas.microsoft.com/ws/2008/06/identity/claims/role";
const NAME_ID_CLAIM =
	"http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier";
const NAME_CLAIM = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name";
const EMAIL_CLAIM =
	"http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress";

function readTokenPayload(token: string): Record<string, unknown> | null {
	try {
		const [, payload] = token.split(".");
		if (!payload) return null;

		const padded = payload
			.replace(/-/g, "+")
			.replace(/_/g, "/")
			.padEnd(payload.length + ((4 - (payload.length % 4)) % 4), "=");

		return JSON.parse(atob(padded)) as Record<string, unknown>;
	} catch {
		return null;
	}
}

function readProfileFromToken(token: string): string | null {
	const data = readTokenPayload(token);
	const role = data?.[ROLE_CLAIM] ?? data?.role;
	return typeof role === "string" ? role : null;
}

function normalizeAuthUser(
	rawUser: Record<string, unknown> | undefined,
	token: string,
	fallbackId: number,
): AuthUser | null {
	const id = Number(rawUser?.id ?? rawUser?.Id ?? fallbackId);

	if (!Number.isInteger(id) || id <= 0) {
		return null;
	}

	return {
		id,
		username: (rawUser?.username ?? rawUser?.Username ?? null) as string | null,
		email: (rawUser?.email ?? rawUser?.Email ?? null) as string | null,
		profile: (rawUser?.profile ??
			rawUser?.Profile ??
			readProfileFromToken(token)) as string | null,
	};
}

export async function registerUser(payload: RegisterPayload) {
	return apiRequest<AuthUser>("/api/Users", {
		method: "POST",
		body: JSON.stringify({
			username: payload.username,
			email: payload.email,
			password_hash: payload.password,
			profile: "Morador",
		}),
	});
}

export async function loginUser(payload: LoginPayload): Promise<AuthResult> {
	const response = await apiRequest<Record<string, unknown>>(
		"/api/Users/auth",
		{
			method: "POST",
			body: JSON.stringify(payload),
		},
	);

	const token = (response.token ?? response.Token) as string | undefined;
	if (!token) {
		throw new Error("O backend não retornou um token de autenticação.");
	}

	const rawUser = (response.user ?? response.User) as
		| Record<string, unknown>
		| undefined;

	return {
		token,
		user: normalizeAuthUser(rawUser, token, 0),
	};
}

export async function exchangeSocial(payload: { provider: string; providerSubject: string; email?: string | null; name?: string | null; emailVerified?: boolean }): Promise<AuthResult> {
	const response = await apiRequest<Record<string, unknown>>("/api/Users/exchange", {
		method: "POST",
		body: JSON.stringify(payload),
	});

	const token = (response.token ?? response.Token) as string | undefined;
	if (!token) {
		throw new Error("O backend não retornou um token de autenticação.");
	}

	const rawUser = (response.user ?? response.User) as Record<string, unknown> | undefined;

	return {
		token,
		user: normalizeAuthUser(rawUser, token, 0),
	};
}

export function saveAuthToken(token: string) {
	if (typeof window === "undefined") return;
	window.localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function getAuthToken() {
	if (typeof window === "undefined") return null;
	return window.localStorage.getItem(AUTH_TOKEN_KEY);
}

export function clearAuthSession() {
	if (typeof window === "undefined") return;

	window.localStorage.removeItem(AUTH_TOKEN_KEY);
	window.localStorage.removeItem(AUTH_USER_KEY);
}

export function saveAuthUser(user: AuthUser | null) {
	if (!user || typeof window === "undefined") return;
	window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

export function getAuthUser(): AuthUser | null {
	if (typeof window === "undefined") return null;

	const storedUser = window.localStorage.getItem(AUTH_USER_KEY);
	const token = window.localStorage.getItem(AUTH_TOKEN_KEY);

	if (storedUser) {
		try {
			const user = JSON.parse(storedUser) as AuthUser;
			return user.profile || !token
				? user
				: { ...user, profile: readProfileFromToken(token) };
		} catch {
			return null;
		}
	}

	if (!token) return null;

	const data = readTokenPayload(token);
	const id = Number(data?.[NAME_ID_CLAIM] ?? data?.nameid);

	if (!Number.isInteger(id) || id <= 0) return null;

	return {
		id,
		username: (data?.[NAME_CLAIM] ?? data?.unique_name ?? null) as
			| string
			| null,
		email: (data?.[EMAIL_CLAIM] ?? data?.email ?? null) as string | null,
		profile: readProfileFromToken(token),
	};
}

export async function updateUserProfile(payload: {
	username?: string;
	email?: string;
	profile?: string;
}) {
	const token = getAuthToken();
	if (!token) throw new Error("Usuário não autenticado");

	const response = await apiRequest<AuthUser>("/api/Users/profile", {
		method: "PUT",
		headers: { Authorization: `Bearer ${token}` },
		body: JSON.stringify(payload),
	});

	saveAuthUser(response);
	return response;
}
