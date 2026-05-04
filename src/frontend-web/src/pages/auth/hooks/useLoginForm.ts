import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { type ChangeEvent, type FormEvent, useState } from "react";
import {
	loginUser,
	saveAuthToken,
	saveAuthUser,
} from "#/services/auth-service";

type LoginForm = {
	email: string;
	password: string;
};

function isValidEmail(email: string): boolean {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function useLoginForm() {
	const navigate = useNavigate();
	const [isPasswordVisible, setIsPasswordVisible] = useState(false);
	const [form, setForm] = useState<LoginForm>({
		email: "",
		password: "",
	});

	const mutation = useMutation({
		mutationFn: () => {
			if (!isValidEmail(form.email)) {
				throw new Error("Informe um e-mail válido.");
			}

			return loginUser({
				email: form.email,
				password: form.password,
			});
		},
		onSuccess: (auth) => {
			saveAuthToken(auth.token);
			saveAuthUser(auth.user);
			navigate({ to: "/deliveries" });
		},
	});

	function updateField(field: keyof LoginForm) {
		return (event: ChangeEvent<HTMLInputElement>) => {
			setForm((currentForm) => ({
				...currentForm,
				[field]: event.target.value,
			}));
		};
	}

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
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
		updateField,
	};
}
