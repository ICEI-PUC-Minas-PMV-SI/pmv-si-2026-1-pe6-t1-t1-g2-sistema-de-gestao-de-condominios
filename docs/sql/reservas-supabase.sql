-- Referência para Supabase / PostgreSQL: tabela public.reservations (schema em inglês), FKs e índices.
-- Se o seu projeto ainda usar public.reservas com colunas em PT, ajuste ApplicationDbContext em src/backend/Data/ApplicationDbContext.cs.

-- Exemplo de colunas no Supabase (conforme dashboard): id, user_id, common_area_id,
-- start_time, end_time, status (enum nativo PostgreSQL, ex. default 'Pendente'::...),
-- created_at, updated_at. Não há coluna notes — o campo opcional na API não é persistido.
--
-- Exemplo ilustrativo (ajuste o tipo enum e TIMESTAMPTZ conforme o seu projeto):
-- CREATE TYPE public.reservation_status AS ENUM ('Pendente', 'Confirmada', 'Cancelada');
-- CREATE TABLE IF NOT EXISTS public.reservations (
--   id SERIAL PRIMARY KEY,
--   common_area_id INTEGER,
--   user_id INTEGER,
--   start_time TIMESTAMP,
--   end_time TIMESTAMP,
--   status public.reservation_status NOT NULL DEFAULT 'Pendente',
--   created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
--   updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
-- );

-- Chaves estrangeiras (execute apenas se as tabelas alvo existirem)
-- ALTER TABLE public.reservations
--   ADD CONSTRAINT fk_reservations_common_area
--   FOREIGN KEY (common_area_id) REFERENCES public.common_areas (id)
--   ON DELETE RESTRICT;

-- ALTER TABLE public.reservations
--   ADD CONSTRAINT fk_reservations_user
--   FOREIGN KEY (user_id) REFERENCES public.users (id)
--   ON DELETE RESTRICT;

CREATE INDEX IF NOT EXISTS idx_reservations_area_tempo
  ON public.reservations (common_area_id, start_time, end_time);

CREATE INDEX IF NOT EXISTS idx_reservations_status
  ON public.reservations (status)
  WHERE status <> 'Cancelada';

-- Ver o nome exato do tipo PostgreSQL da coluna status (use o mesmo em Program.cs: MapEnum<...>("...")):
-- SELECT format_type(a.atttypid, a.atttypmod) AS status_column_type
-- FROM pg_attribute a
-- JOIN pg_class c ON c.oid = a.attrelid
-- JOIN pg_namespace n ON n.oid = c.relnamespace
-- WHERE n.nspname = 'public' AND c.relname = 'reservations' AND a.attname = 'status' AND NOT a.attisdropped;
