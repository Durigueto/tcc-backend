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

  // Dados completos para tabelas com o schema avançado
  const metricasCompletas = metricas.map(m => ({
    jogador_id: m.id,
    distancia_total: m.distanciaTotal,
    velocidade_maxima: m.velocidadeMaxima,
    velocidade_media: m.velocidadeMedia,
    metros_por_minuto: m.metrosPorMinuto,
    distancia_andando: m.distanciaAndando,
    distancia_trotando: m.distanciaTrotando,
    distancia_correndo: m.distanciaCorrendo,
    distancia_sprint: m.distanciaSprint,
    aceleracoes_altas: m.aceleracoesAltas,
    desaceleracoes_altas: m.desaceleracoesAltas,
    player_load: m.playerLoad,
    sprints_contagem: m.sprintsContagem,
    potencia_metabolica_media: m.potenciaMetabolicaMedia,
    centroide_x: m.centroideX,
    centroide_y: m.centroideY,
    posicao_sugerida: m.posicaoSugerida
  }));

  const { error } = await supabase.from('metricas_rastreamento').insert(metricasCompletas);

  if (error) {
    console.warn('[SUPABASE] Tabela ainda sem colunas estendidas. Salvando no formato básico...', error.message);
    
    // Fallback gracioso: salva nas colunas base originais
    const metricasBasicas = metricas.map(m => ({
      jogador_id: m.id,
      distancia_total: m.distanciaTotal,
      velocidade_maxima: m.velocidadeMaxima,
      distancia_andando: m.distanciaAndando,
      distancia_trotando: m.distanciaTrotando,
      distancia_correndo: m.distanciaCorrendo,
      distancia_sprint: m.distanciaSprint
    }));

    const { error: errBasico } = await supabase.from('metricas_rastreamento').insert(metricasBasicas);
    if (errBasico) {
      console.error('[SUPABASE] Erro ao salvar no formato base:', errBasico.message);
    }
  }
}
