import { NextRequest, NextResponse } from 'next/server';
import { processarRastreamento } from '@/lib/algoritmoRastreamento';
import { salvarMetricasSupabase } from '@/lib/clienteSupabase';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const url = formData.get('url') as string;
    const file = formData.get('file') as File;

    let conteudoCsv = '';

    if (url) {
      // Buscar arquivo dinamicamente da URL (ex: repositório da Metrica Sports)
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Erro ao baixar arquivo da URL: ${response.statusText}`);
      }
      conteudoCsv = await response.text();
    } else if (file) {
      // Processar upload de arquivo
      conteudoCsv = await file.text();
    } else {
      return NextResponse.json(
        { sucesso: false, erro: 'Forneça um "file" ou uma "url".' },
        { status: 400, headers: corsHeaders }
      );
    }
    
    // Processa os dados brutos de cinemática
    const metricas = processarRastreamento(conteudoCsv);
    
    // Simula (ou executa) o salvamento no Supabase
    await salvarMetricasSupabase(metricas);

    // Retorna o JSON processado
    return NextResponse.json(
      { 
        sucesso: true, 
        quantidadeJogadores: metricas.length,
        dados: metricas 
      },
      { headers: corsHeaders }
    );
  } catch (erro: any) {
    return NextResponse.json(
      { sucesso: false, erro: erro.message },
      { status: 500, headers: corsHeaders }
    );
  }
}

