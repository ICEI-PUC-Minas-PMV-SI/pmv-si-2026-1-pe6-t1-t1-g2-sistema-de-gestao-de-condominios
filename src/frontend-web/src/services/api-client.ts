type ApiErrorPayload = {
	title?: string;
	detail?: string;
	message?: string;
	errors?: Record<string, string[]>;
};

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, "") ?? "";
const DEFAULT_ERROR_MESSAGE = "Não foi possível concluir a solicitação.";

async function readApiError(response: Response) {
	const contentType = response.headers.get("content-type") ?? "";

	if (contentType.includes("application/json")) {
		const payload = (await response
			.json()
			.catch(() => null)) as ApiErrorPayload | null;

		if (payload?.errors) {
			const firstError = Object.values(payload.errors).flat()[0];
			if (firstError) return firstError;
		}

		return (
			payload?.message ??
			payload?.detail ??
			payload?.title ??
			DEFAULT_ERROR_MESSAGE
		);
	}

	const text = await response.text().catch(() => "");
	return text || DEFAULT_ERROR_MESSAGE;
}

export async function apiRequest<TResponse>(
    path: string,
    options: RequestInit = {},
): Promise<TResponse> {
    // 1. Criamos um objeto de headers a partir das opções enviadas
    const headers = new Headers(options.headers);

    // 2. SÓ adicionamos o Content-Type JSON se o body NÃO for um FormData
    // Se for FormData (upload de arquivo), deixamos o browser definir o header sozinho
    if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers, // Usamos o nosso objeto de headers inteligente
    });

    if (!response.ok) {
        throw new Error(await readApiError(response));
    }

    if (response.status === 204) {
        return undefined as TResponse;
    }

    return response.json() as Promise<TResponse>;
}