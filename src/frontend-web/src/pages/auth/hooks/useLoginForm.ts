import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { type ChangeEvent, type FormEvent, useEffect, useState } from "react";
import {
	clearLastRegisteredUserId,
	getLastRegisteredUserId,
	loginUser,
	saveAuthToken,
	saveAuthUser,
} from "#/services/auth-service";

type LoginForm = {
	userId: string;
	password: string;
};

export function useLoginForm() {
	const navigate = useNavigate();
	const [isPasswordVisible, setIsPasswordVisible] = useState(false);
	const [form, setForm] = useState<LoginForm>({
		userId: "",
		password: "",
	});

	const mutation = useMutation({
		mutationFn: () => {
			const id = Number(form.userId);

			if (!Number.isInteger(id) || id <= 0) {
				throw new Error("Informe um ID de usuário válido.");
			}

			return loginUser({
				id,
				password: form.password,
			});
		},
		onSuccess: (auth) => {
			saveAuthToken(auth.token);
			saveAuthUser(auth.user);
			clearLastRegisteredUserId();
			navigate({ to: "/deliveries" });
		},
	});

	useEffect(() => {
		const lastRegisteredUserId = getLastRegisteredUserId();

		if (lastRegisteredUserId) {
			setForm((currentForm) => ({
				...currentForm,
				userId: lastRegisteredUserId,
			}));
		}
	}, []);

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
