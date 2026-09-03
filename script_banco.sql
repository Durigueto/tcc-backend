-- Script para criar a tabela de métricas de rastreamento no Supabase
CREATE TABLE metricas_rastreamento (
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
