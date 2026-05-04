export function getProfileLabel(profile?: string | null) {
	const normalizedProfile = profile?.toLowerCase();

	if (normalizedProfile === "administrador") return "Administrador";
	if (normalizedProfile === "morador") return "Morador";
	return "Perfil";
}

export function getAvatarUrl(name: string, profile?: string | null) {
	const background =
		profile?.toLowerCase() === "administrador" ? "2f4f8f" : "2f6a4a";
	const encodedName = encodeURIComponent(name);

	return `https://ui-avatars.com/api/?name=${encodedName}&background=${background}&color=fff&bold=true`;
}
