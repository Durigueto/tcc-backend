// Dimensões do campo fornecidas pela Metrica Sports
const COMPRIMENTO_CAMPO = 105; // metros
const LARGURA_CAMPO = 68; // metros

export interface MetricaJogador {
  id: string;
  distanciaTotal: number;
  velocidadeMaxima: number;
  distanciaAndando: number; // <= 7.2 km/h
  distanciaTrotando: number; // > 7.2 e <= 14.4 km/h
  distanciaCorrendo: number; // > 14.4 e <= 19.8 km/h
  distanciaSprint: number; // > 19.8 km/h
}

export function processarRastreamento(conteudoCsv: string): MetricaJogador[] {
  const linhas = conteudoCsv.split('\n');
  
  if (linhas.length < 4) {
    throw new Error('Arquivo de dados inválido ou vazio.');
  }

  // Linha 2 contém os IDs dos jogadores (ex: ,,,11,,1,,2...)
  const cabecalhoIds = linhas[1].split(',');
  // Mapeamento: { "11": { colX: 3, colY: 4 }, ... }
  const mapaJogadores: Record<string, { colX: number, colY: number }> = {};
  
  for (let i = 0; i < cabecalhoIds.length; i++) {
    const id = cabecalhoIds[i].trim();
    if (id && id !== 'Ball' && !isNaN(Number(id))) {
      mapaJogadores[id] = { colX: i, colY: i + 1 };
    }
  }

  // Estado anterior dos jogadores para cálculo de delta
  // { "11": { xAnt: 0, yAnt: 0, tAnt: 0 } }
  const estadoAnterior: Record<string, { x: number, y: number, tempo: number }> = {};
  
  // Resultados agregados
  const resultados: Record<string, MetricaJogador> = {};
  Object.keys(mapaJogadores).forEach(id => {
    resultados[id] = { 
      id, 
      distanciaTotal: 0, 
      velocidadeMaxima: 0, 
      distanciaAndando: 0,
      distanciaTrotando: 0,
      distanciaCorrendo: 0,
      distanciaSprint: 0 
    };
  });

  // Linha 4 em diante são os frames de dados
  for (let i = 3; i < linhas.length; i++) {
    const linha = linhas[i].trim();
    if (!linha) continue;

    const dados = linha.split(',');
    const tempo = parseFloat(dados[2]); // Coluna de tempo em segundos

    if (isNaN(tempo)) continue;

    for (const [id, cols] of Object.entries(mapaJogadores)) {
      const valX = dados[cols.colX];
      const valY = dados[cols.colY];

      if (!valX || !valY || valX === 'NaN' || valY === 'NaN') {
        continue; // Jogador fora de campo neste frame
      }

      const x = parseFloat(valX) * COMPRIMENTO_CAMPO;
      const y = parseFloat(valY) * LARGURA_CAMPO;

      if (estadoAnterior[id]) {
        const deltaX = x - estadoAnterior[id].x;
        const deltaY = y - estadoAnterior[id].y;
        const deltaT = tempo - estadoAnterior[id].tempo;

        if (deltaT > 0 && deltaT < 1) { // Evita pulos de tempo absurdos
          // Distância euclidiana em metros
          const distancia = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
          
          // Velocidade em km/h
          const velocidadeMs = distancia / deltaT;
          const velocidadeKmh = velocidadeMs * 3.6;

          // Agrega os dados
          resultados[id].distanciaTotal += distancia;
          if (velocidadeKmh > resultados[id].velocidadeMaxima) {
            resultados[id].velocidadeMaxima = velocidadeKmh;
          }
          
          if (velocidadeKmh <= 7.2) {
            resultados[id].distanciaAndando += distancia;
          } else if (velocidadeKmh <= 14.4) {
            resultados[id].distanciaTrotando += distancia;
          } else if (velocidadeKmh <= 19.8) {
            resultados[id].distanciaCorrendo += distancia;
          } else {
            resultados[id].distanciaSprint += distancia;
          }
        }
      }

      // Atualiza o estado anterior
      estadoAnterior[id] = { x, y, tempo };
    }
  }

  return Object.values(resultados);
}
