import { NextResponse } from 'next/server';
import path from 'path';
import { processarRastreamento } from '@/lib/algoritmoRastreamento';
import { salvarMetricasSupabase } from '@/lib/clienteSupabase';

export async function GET() {
  try {
    // Caminho fixo para o arquivo CSV de teste local
    const caminhoCsv = path.join(process.cwd(), 'dados', 'dados_rastreamento_exemplo.csv');
    
    // Processa os dados brutos de cinemática
    const metricas = processarRastreamento(caminhoCsv);
    
    // Simula (ou executa) o salvamento no Supabase
    await salvarMetricasSupabase(metricas);

    // Retorna o JSON processado
    return NextResponse.json({ 
      sucesso: true, 
      quantidadeJogadores: metricas.length,
      dados: metricas 
    });
  } catch (erro: any) {
    return NextResponse.json({ sucesso: false, erro: erro.message }, { status: 500 });
  }
}
