-- Referência para Supabase / PostgreSQL: tabela public.reservations (schema em inglês), FKs e índices.
-- Se o seu projeto ainda usar public.reservas com colunas em PT, ajuste ApplicationDbContext em src/backend/Data/ApplicationDbContext.cs.

-- Exemplo de criação alinhado ao EF atual (nomes de coluna em inglês):
-- CREATE TABLE IF NOT EXISTS public.reservations (
--   id SERIAL PRIMARY KEY,
--   common_area_id INTEGER NOT NULL,
--   user_id INTEGER NOT NULL,
--   start_time TIMESTAMPTZ NOT NULL,
--   end_time TIMESTAMPTZ NOT NULL,
--   status TEXT NOT NULL,
--   notes TEXT,
--   created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
--   updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
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
