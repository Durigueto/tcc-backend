import { createClient } from '@supabase/supabase-js';
import { MetricaJogador } from './algoritmoRastreamento';

const urlSupabase = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const chaveSupabase = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
export const supabase = (urlSupabase && chaveSupabase) ? createClient(urlSupabase, chaveSupabase) : null;

export async function salvarMetricasSupabase(metricas: MetricaJogador[]) {
  if (!supabase) {
    console.warn('[SUPABASE] Cliente não inicializado. Verifique as chaves no .env.local');
    return;
  }

  // Mapear os nomes de propriedades camelCase (TypeScript) para snake_case (PostgreSQL)
  const metricasFormatadas = metricas.map(m => ({
    jogador_id: m.id,
    distancia_total: m.distanciaTotal,
    velocidade_maxima: m.velocidadeMaxima,
    distancia_andando: m.distanciaAndando,
    distancia_trotando: m.distanciaTrotando,
    distancia_correndo: m.distanciaCorrendo,
    distancia_sprint: m.distanciaSprint
  }));

  const { data, error } = await supabase.from('metricas_rastreamento').insert(metricasFormatadas);
  
  if (error) {
    console.error('Erro ao salvar no banco Supabase:', error);
    throw new Error('Falha ao salvar no banco de dados');
  }
}
