let authToken: string | null = null;
let authUserId: number | null = null;

export function setAuthToken(token: string | null) {
  authToken = token?.trim() || null;
}

export function getAuthToken() {
  return authToken;
}

export function setAuthUserId(userId: number | null) {
  authUserId = typeof userId === "number" && Number.isInteger(userId) && userId > 0 ? userId : null;
}

export function getAuthUserId() {
  return authUserId;
}

export function clearAuthToken() {
  authToken = null;
  authUserId = null;
}