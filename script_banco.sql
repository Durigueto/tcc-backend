-- Script para criar a tabela de métricas de rastreamento no Supabase (Versão Completa)
CREATE TABLE IF NOT EXISTS metricas_rastreamento (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  jogador_id text NOT NULL,
  distancia_total numeric NOT NULL,
  velocidade_maxima numeric NOT NULL,
  distancia_andando numeric NOT NULL,
  distancia_trotando numeric NOT NULL,
  distancia_correndo numeric NOT NULL,
  distancia_sprint numeric NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Caso a tabela já exista com as colunas antigas, execute os comandos abaixo para adicionar as métricas esportivas aprofundadas:
ALTER TABLE metricas_rastreamento ADD COLUMN IF NOT EXISTS velocidade_media numeric;
ALTER TABLE metricas_rastreamento ADD COLUMN IF NOT EXISTS metros_por_minuto numeric;
ALTER TABLE metricas_rastreamento ADD COLUMN IF NOT EXISTS aceleracoes_altas integer;
ALTER TABLE metricas_rastreamento ADD COLUMN IF NOT EXISTS desaceleracoes_altas integer;
ALTER TABLE metricas_rastreamento ADD COLUMN IF NOT EXISTS player_load numeric;
ALTER TABLE metricas_rastreamento ADD COLUMN IF NOT EXISTS sprints_contagem integer;
ALTER TABLE metricas_rastreamento ADD COLUMN IF NOT EXISTS potencia_metabolica_media numeric;
ALTER TABLE metricas_rastreamento ADD COLUMN IF NOT EXISTS centroide_x numeric;
ALTER TABLE metricas_rastreamento ADD COLUMN IF NOT EXISTS centroide_y numeric;
ALTER TABLE metricas_rastreamento ADD COLUMN IF NOT EXISTS posicao_sugerida text;

-- Habilitar o Row Level Security (RLS) para permitir inserção pública (para testes)
ALTER TABLE metricas_rastreamento ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir inserções anonimas" 
ON metricas_rastreamento FOR INSERT 
TO anon 
WITH CHECK (true);

CREATE POLICY "Permitir leitura anonima" 
ON metricas_rastreamento FOR SELECT 
TO anon 
USING (true);
