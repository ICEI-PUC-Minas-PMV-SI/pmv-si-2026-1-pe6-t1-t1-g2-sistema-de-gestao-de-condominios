import Constants from "expo-constants";
import { Platform } from "react-native";

type ApiErrorPayload = {
  title?: string;
  detail?: string;
  message?: string;
  errors?: Record<string, string[]>;
};

export type AuthUser = {
  id: number;
  username: string | null;
  email: string | null;
  profile: string | null;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  username: string;
  email: string;
  password: string;
};

export type AuthResult = {
  token: string;
  user: AuthUser | null;
};

export type SocialCodeExchangePayload = {
  provider: string;
  code: string;
  codeVerifier?: string | null;
  redirectUri?: string | null;
};

function getMetroHost() {
  const hostUri =
    Constants.expoConfig?.hostUri ??
    Constants.manifest2?.extra?.expoClient?.hostUri ??
    Constants.manifest?.debuggerHost;

  if (!hostUri) {
    return null;
  }

  const host = hostUri.split(":")[0]?.trim();
  return host || null;
}

function getBackendBaseUrl() {
  const envUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (envUrl) {
    return envUrl.replace(/\/$/, "");
  }

  if (Platform.OS === "web") {
    return "http://localhost:5219";
  }

  const metroHost = getMetroHost();
  if (metroHost) {
    return `http://${metroHost}:5219`;
  }

  return Platform.select({
    android: "http://10.0.2.2:5219",
    ios: "http://localhost:5219",
    default: "http://localhost:5219",
  }) as string;
}

const API_BASE_URL = getBackendBaseUrl();
const API_REQUEST_TIMEOUT_MS = 15000;

const DEFAULT_ERROR_MESSAGE = "Não foi possível concluir a solicitação.";

function normalizeUser(rawUser: Record<string, unknown> | null | undefined): AuthUser | null {
  if (!rawUser) {
    return null;
  }

  const id = Number(rawUser.id ?? rawUser.Id);
  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

  return {
    id,
    username: (rawUser.username ?? rawUser.Username ?? null) as string | null,
    email: (rawUser.email ?? rawUser.Email ?? null) as string | null,
    profile: (rawUser.profile ?? rawUser.Profile ?? null) as string | null,
  };
}

async function readApiError(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const payload = (await response.json().catch(() => null)) as ApiErrorPayload | null;

    if (payload?.errors) {
      const firstError = Object.values(payload.errors).flat()[0];
      if (firstError) {
        return firstError;
      }
    }

    return (
      payload?.message ?? payload?.detail ?? payload?.title ?? DEFAULT_ERROR_MESSAGE
    );
  }

  const text = await response.text().catch(() => "");
  return text || DEFAULT_ERROR_MESSAGE;
}

export async function apiRequest<TResponse>(
  path: string,
  options: RequestInit = {},
): Promise<TResponse> {
  const headers = new Headers(options.headers);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_REQUEST_TIMEOUT_MS);

  if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(await readApiError(response));
    }

    if (response.status === 204) {
      return undefined as TResponse;
    }

    return response.json() as Promise<TResponse>;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(
        `A API não respondeu em tempo hábil em ${API_BASE_URL}. Verifique se o backend está ativo e acessível pelo emulador ou dispositivo.`,
      );
    }

    throw new Error(
      `Falha ao conectar em ${API_BASE_URL}. Verifique se o backend está em execução e se o dispositivo consegue acessar esse endereço.`,
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

function normalizeAuthResult(response: Record<string, unknown>): AuthResult {
  const token = (response.token ?? response.Token) as string | undefined;
  if (!token) {
    throw new Error("O backend não retornou um token de autenticação.");
  }

  return {
    token,
    user: normalizeUser((response.user ?? response.User) as Record<string, unknown> | null | undefined),
  };
}

export async function loginUser(payload: LoginPayload): Promise<AuthResult> {
  const response = await apiRequest<Record<string, unknown>>("/api/users/auth", {
    method: "POST",
    body: JSON.stringify({
      email: payload.email,
      password: payload.password,
    }),
  });

  return normalizeAuthResult(response);
}

export async function registerUser(payload: RegisterPayload): Promise<AuthUser> {
  const response = await apiRequest<Record<string, unknown>>("/api/users", {
    method: "POST",
    body: JSON.stringify({
      username: payload.username,
      email: payload.email,
      password_hash: payload.password,
      profile: "Morador",
    }),
  });

  const user = normalizeUser(response);
  if (!user) {
    throw new Error("O backend não retornou os dados do usuário criado.");
  }

  return user;
}

export async function exchangeSocialCode(
  payload: SocialCodeExchangePayload,
): Promise<AuthResult> {
  const response = await apiRequest<Record<string, unknown>>("/api/users/exchange-code", {
    method: "POST",
    body: JSON.stringify({
      provider: payload.provider,
      code: payload.code,
      codeVerifier: payload.codeVerifier ?? undefined,
      redirectUri: payload.redirectUri ?? undefined,
    }),
  });

  return normalizeAuthResult(response);
}