-- Referência para Supabase / PostgreSQL: tabela public.reservas, FKs e índices.
-- Ajuste o nome da tabela referenciada por morador_id conforme o seu modelo (ex.: users, moradores).

-- Exemplo de criação (se ainda não existir), alinhado ao uso na API:
-- CREATE TABLE IF NOT EXISTS public.reservas (
--   id SERIAL PRIMARY KEY,
--   area_comum_id INTEGER NOT NULL,
--   morador_id INTEGER NOT NULL,
--   data_hora_inicio TIMESTAMPTZ NOT NULL,
--   data_hora_fim TIMESTAMPTZ NOT NULL,
--   status TEXT NOT NULL,
--   observacao TEXT,
--   created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
--   updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
-- );

-- Chaves estrangeiras (execute apenas se as tabelas alvo existirem)
-- ALTER TABLE public.reservas
--   ADD CONSTRAINT fk_reservas_common_area
--   FOREIGN KEY (area_comum_id) REFERENCES public.common_areas (id)
--   ON DELETE RESTRICT;

-- ALTER TABLE public.reservas
--   ADD CONSTRAINT fk_reservas_morador
--   FOREIGN KEY (morador_id) REFERENCES public.users (id)
--   ON DELETE RESTRICT;

-- Índice para consultas por área e intervalo (conflito de horários e listagens)
CREATE INDEX IF NOT EXISTS idx_reservas_area_tempo
  ON public.reservas (area_comum_id, data_hora_inicio, data_hora_fim);

CREATE INDEX IF NOT EXISTS idx_reservas_status
  ON public.reservas (status)
  WHERE status <> 'Cancelada';
