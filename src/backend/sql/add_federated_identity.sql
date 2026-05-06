-- Add federated identity columns for social login
ALTER TABLE public.users
    ADD COLUMN IF NOT EXISTS provider text;

ALTER TABLE public.users
    ADD COLUMN IF NOT EXISTS provider_subject text;

ALTER TABLE public.users
    ADD COLUMN IF NOT EXISTS email_verified boolean DEFAULT false;

-- Optionally create an index to speed provider lookups
CREATE INDEX IF NOT EXISTS idx_users_provider_subject ON public.users(provider, provider_subject);
