let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token?.trim() || null;
}

export function getAuthToken() {
  return authToken;
}

export function clearAuthToken() {
  authToken = null;
}