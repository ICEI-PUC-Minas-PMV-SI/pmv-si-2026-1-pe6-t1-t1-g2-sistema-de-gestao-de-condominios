import type { AuthUser } from "./auth";

let authToken: string | null = null;
let authUser: AuthUser | null = null;

export function setAuthToken(token: string | null) {
  authToken = token?.trim() || null;
}

export function getAuthToken() {
  return authToken;
}

export function setAuthUser(user: AuthUser | null) {
  authUser = user;
}

export function getAuthUser() {
  return authUser;
}

export function clearAuthToken() {
  authToken = null;
  authUser = null;
}