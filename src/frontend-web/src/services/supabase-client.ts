import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabasePublishableKey = import.meta.env
	.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

if (!supabaseUrl) {
	throw new Error("VITE_SUPABASE_URL não está configurada.");
}

if (!supabasePublishableKey) {
	throw new Error("VITE_SUPABASE_PUBLISHABLE_KEY não está configurada.");
}

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
	auth: {
		persistSession: true,
		autoRefreshToken: true,
		detectSessionInUrl: false,
		flowType: "pkce",
	},
});