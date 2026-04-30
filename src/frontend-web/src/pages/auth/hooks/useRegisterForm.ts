import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { type ChangeEvent, type FormEvent, useState } from "react";
import {
	registerUser,
	saveLastRegisteredUserId,
} from "#/services/auth-service";

type RegisterForm = {
	username: string;
	email: string;
	password: string;
};

export function useRegisterForm() {
	const navigate = useNavigate();
	const [isPasswordVisible, setIsPasswordVisible] = useState(false);
	const [form, setForm] = useState<RegisterForm>({
		username: "",
		email: "",
		password: "",
	});

	const mutation = useMutation({
		mutationFn: () => registerUser(form),
		onSuccess: (user) => {
			saveLastRegisteredUserId(user.id);
			navigate({ to: "/login" });
		},
	});

	function updateField(field: keyof RegisterForm) {
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
