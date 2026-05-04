export type AuthUser = {
	id: number;
	username: string | null;
	email: string | null;
	profile: string | null;
};

export type RegisterPayload = {
	username: string;
	email: string;
	password: string;
};

export type LoginPayload = {
	email: string;
	password: string;
};

export type AuthResult = {
	token: string;
	user: AuthUser | null;
};
