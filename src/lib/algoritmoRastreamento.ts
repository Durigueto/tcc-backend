// Dimensões oficiais do campo fornecidas pela Metrica Sports
export const COMPRIMENTO_CAMPO = 105; // metros
export const LARGURA_CAMPO = 68; // metros

export interface PontoPosicao {
  x: number; // metros (0 a 105)
  y: number; // metros (0 a 68)
}

export interface BlocoTemporal {
  indice: number;
  rotulo: string; // "0-15'", "15-30'", "30-45'", "45-60'", "60-75'", "75-90'+"
  tempoInicioMinutos: number;
  tempoFimMinutos: number;
  distanciaTotal: number;
  metrosPorMinuto: number;
  distanciaHSR: number; // Z4 (19.8 a 25.2 km/h)
  distanciaSprint: number; // Z5 (> 25.2 km/h)
  sprintsContagem: number;
  velocidadeMaxima: number;
  aceleracoesAltas: number;
  decaimentoPercentual: number; // % de variação em relação ao bloco pico
  classificacao: 'pico' | 'otimo' | 'estavel' | 'queda-moderada' | 'queda-severa';
}

export interface MetricaJogador {
  id: string;
  // Cinemática básica & Intensidade
  distanciaTotal: number; // metros
  velocidadeMaxima: number; // km/h
  velocidadeMedia: number; // km/h
  metrosPorMinuto: number; // M/min (índice ouro de intensidade no futebol)
  tempoTotalSegundos: number; // segundos jogados/rastreados

  // Zonas de Velocidade (metros) - Compatibilidade e 5 Zonas Padronizadas
  distanciaAndando: number; // <= 7.2 km/h
  distanciaTrotando: number; // > 7.2 e <= 14.4 km/h
  distanciaCorrendo: number; // > 14.4 e <= 19.8 km/h
  distanciaSprint: number; // > 19.8 km/h
  distanciaZ1Caminhada: number; // 0 a 7.2 km/h
  distanciaZ2Trote: number; // 7.2 a 14.4 km/h
  distanciaZ3Media: number; // 14.4 a 19.8 km/h
  distanciaZ4HSR: number; // 19.8 a 25.2 km/h (High-Speed Running)
  distanciaZ5Sprint: number; // > 25.2 km/h (Sprint Puro)
  minutosJogados: number; // minutos totais jogados na partida

  // Dinâmica Inercial & Acelerações (Neuromuscular / Carga Mecânica)
  aceleracoesAltas: number; // Ações discretas com a >= +2.5 m/s²
  aceleracoesExplosivas: number; // Ações discretas com a >= +3.0 m/s²
  desaceleracoesAltas: number; // Ações discretas com a <= -2.5 m/s² (frenagens)
  desaceleracoesCriticas: number; // Ações discretas com a <= -3.0 m/s²
  distanciaAcelerando: number; // metros percorridos em aceleração alta
  distanciaDesacelerando: number; // metros percorridos em desaceleração alta
  aceleracaoMaxima: number; // pico fisiológico em m/s²
  desaceleracaoMaxima: number; // pico fisiológico em m/s²
  playerLoad: number; // Carga mecânica acumulada (vetor de aceleração)

  // Análise de Sprints (Ações e Duração)
  sprintsContagem: number; // quantidade de tiros > 19.8 km/h
  sprintsPicosContagem: number; // quantidade de tiros > 25.2 km/h (critério ouro)
  distanciaMediaSprint: number; // metros médios por tiro de sprint

  // Potência Metabólica (Metabolic Power - Di Prampero & Osgnach)
  potenciaMetabolicaMedia: number; // W/kg
  distanciaAltaPotenciaMetabolica: number; // HPMD metros com > 20 W/kg

  // Análise Espacial & Tática
  centroideX: number; // metros (0 a 105)
  centroideY: number; // metros (0 a 68)
  raioAcao: number; // dispersão espacial em metros (amplitude de cobertura)
  posicaoSugerida: string; // Inferência tática (ex: Lateral, Zagueiro, Meia, Atacante)
  amostrasPosicao: PontoPosicao[]; // Amostragem temporal para heatmap / trilha tática

  // Análise Temporal de Decaimento de Intensidade & Fadiga (Blocos de 15' e 1ºT vs 2ºT)
  blocosTemporais?: BlocoTemporal[];
  analisePrimeiroTempo?: { distancia: number; metrosPorMinuto: number; hsr: number; sprints: number };
  analiseSegundoTempo?: { distancia: number; metrosPorMinuto: number; hsr: number; sprints: number };
  decaimentoSegundoTempoPercentual?: number;
  momentoQuedaIntensidade?: string;
  diagnosticoFadiga?: {
    tipo: string;
    momentoQueda: string;
    quedaPercentual: number;
    recomendacaoComissao: string;
    gravidade: 'normal' | 'alerta' | 'critico';
  };
}

interface EstadoJogadorAnterior {
  x: number;
  y: number;
  tempo: number;
  vx: number;
  vy: number;
  vFiltrada: number;
  tempoUltimaAcelAlta: number;
  tempoUltimaDesacelAlta: number;
  tempoUltimoSprint: number;
  emAceleracaoAlta: boolean;
  emDesaceleracaoAlta: boolean;
  emSprint: boolean;
}

export function inferirPosicaoTatica(x: number, y: number): string {
  // Campo: 0 a 105 metros no comprimento, 0 a 68 metros na largura
  // O centro do campo é (52.5, 34)
  if (x < 18 || x > 87) {
    if (y >= 20 && y <= 48) return 'Goleiro';
  }
  if (x < 42) {
    if (y < 22 || y > 46) return 'Lateral';
    return 'Zagueiro Central';
  }
  if (x <= 68) {
    if (y < 20 || y > 48) return 'Meio-Campista Lateral / Ala';
    return 'Meio-Campista Central / Volante';
  }
  if (y < 22 || y > 46) return 'Ponta / Extremo';
  return 'Centroavante / Atacante';
}

export function processarRastreamento(conteudoCsv: string): MetricaJogador[] {
  const linhas = conteudoCsv.split('\n');

  if (linhas.length < 4) {
    throw new Error('Arquivo de dados inválido ou vazio.');
  }

  // Linha 2 contém os IDs dos jogadores (ex: ,,,11,,1,,2...)
  const cabecalhoIds = linhas[1].split(',');
  const mapaJogadores: Record<string, { colX: number; colY: number }> = {};

  for (let i = 0; i < cabecalhoIds.length; i++) {
    const id = cabecalhoIds[i].trim();
    if (id && id !== 'Ball' && !isNaN(Number(id))) {
      mapaJogadores[id] = { colX: i, colY: i + 1 };
    }
  }

  const estadoAnterior: Record<string, EstadoJogadorAnterior> = {};

  interface AcumuladorBloco {
    distancia: number;
    tempoSegundos: number;
    distanciaHSR: number;
    distanciaSprint: number;
    sprintsContagem: number;
    velocidadeMaxima: number;
    aceleracoesAltas: number;
  }

  const criarBlocosIniciais = (): AcumuladorBloco[] => [
    { distancia: 0, tempoSegundos: 0, distanciaHSR: 0, distanciaSprint: 0, sprintsContagem: 0, velocidadeMaxima: 0, aceleracoesAltas: 0 },
    { distancia: 0, tempoSegundos: 0, distanciaHSR: 0, distanciaSprint: 0, sprintsContagem: 0, velocidadeMaxima: 0, aceleracoesAltas: 0 },
    { distancia: 0, tempoSegundos: 0, distanciaHSR: 0, distanciaSprint: 0, sprintsContagem: 0, velocidadeMaxima: 0, aceleracoesAltas: 0 },
    { distancia: 0, tempoSegundos: 0, distanciaHSR: 0, distanciaSprint: 0, sprintsContagem: 0, velocidadeMaxima: 0, aceleracoesAltas: 0 },
    { distancia: 0, tempoSegundos: 0, distanciaHSR: 0, distanciaSprint: 0, sprintsContagem: 0, velocidadeMaxima: 0, aceleracoesAltas: 0 },
    { distancia: 0, tempoSegundos: 0, distanciaHSR: 0, distanciaSprint: 0, sprintsContagem: 0, velocidadeMaxima: 0, aceleracoesAltas: 0 }
  ];

  // Acumuladores e resultados
  const acumuladores: Record<
    string,
    {
      metrica: MetricaJogador;
      somaX: number;
      somaY: number;
      somaX2: number;
      somaY2: number;
      numAmostrasValidas: number;
      somaPotenciaMetabolicaPonderada: number;
      contadorFramesAmostra: number;
      blocos: AcumuladorBloco[];
      tempo1: { distancia: number; tempoSegundos: number; hsr: number; sprints: number };
      tempo2: { distancia: number; tempoSegundos: number; hsr: number; sprints: number };
    }
  > = {};

  Object.keys(mapaJogadores).forEach((id) => {
    acumuladores[id] = {
      metrica: {
        id,
        distanciaTotal: 0,
        velocidadeMaxima: 0,
        velocidadeMedia: 0,
        metrosPorMinuto: 0,
        tempoTotalSegundos: 0,
        distanciaAndando: 0,
        distanciaTrotando: 0,
        distanciaCorrendo: 0,
        distanciaSprint: 0,
        distanciaZ1Caminhada: 0,
        distanciaZ2Trote: 0,
        distanciaZ3Media: 0,
        distanciaZ4HSR: 0,
        distanciaZ5Sprint: 0,
        minutosJogados: 0,
        aceleracoesAltas: 0,
        aceleracoesExplosivas: 0,
        desaceleracoesAltas: 0,
        desaceleracoesCriticas: 0,
        distanciaAcelerando: 0,
        distanciaDesacelerando: 0,
        aceleracaoMaxima: 0,
        desaceleracaoMaxima: 0,
        playerLoad: 0,
        sprintsContagem: 0,
        distanciaMediaSprint: 0,
        potenciaMetabolicaMedia: 0,
        distanciaAltaPotenciaMetabolica: 0,
        centroideX: 0,
        centroideY: 0,
        raioAcao: 0,
        posicaoSugerida: 'Em Campo',
        amostrasPosicao: []
      },
      somaX: 0,
      somaY: 0,
      somaX2: 0,
      somaY2: 0,
      numAmostrasValidas: 0,
      somaPotenciaMetabolicaPonderada: 0,
      contadorFramesAmostra: 0,
      blocos: criarBlocosIniciais(),
      tempo1: { distancia: 0, tempoSegundos: 0, hsr: 0, sprints: 0 },
      tempo2: { distancia: 0, tempoSegundos: 0, hsr: 0, sprints: 0 }
    };
  });

  // Linha 4 em diante são os frames de dados
  for (let i = 3; i < linhas.length; i++) {
    const linha = linhas[i].trim();
    if (!linha) continue;

    const dados = linha.split(',');
    const tempo = parseFloat(dados[2]); // Coluna de tempo em segundos
    const periodo = parseInt(dados[0]) || (tempo < 2700 ? 1 : 2);

    if (isNaN(tempo)) continue;

    for (const [id, cols] of Object.entries(mapaJogadores)) {
      const valX = dados[cols.colX];
      const valY = dados[cols.colY];

      if (!valX || !valY || valX === 'NaN' || valY === 'NaN') {
        continue; // Jogador fora de campo neste frame
      }

      const x = parseFloat(valX) * COMPRIMENTO_CAMPO;
      const y = parseFloat(valY) * LARGURA_CAMPO;

      const item = acumuladores[id];
      const met = item.metrica;

      // Acumula estatísticas espaciais
      item.somaX += x;
      item.somaY += y;
      item.somaX2 += x * x;
      item.somaY2 += y * y;
      item.numAmostrasValidas++;

      // Amostragem de posições (a cada 25 frames ~= 1 segundo para visualização leve no mini campo)
      item.contadorFramesAmostra++;
      if (item.contadorFramesAmostra >= 25) {
        item.contadorFramesAmostra = 0;
        item.metrica.amostrasPosicao.push({
          x: Math.round(x * 10) / 10,
          y: Math.round(y * 10) / 10
        });
      }

      const prev = estadoAnterior[id];

      if (prev) {
        const deltaX = x - prev.x;
        const deltaY = y - prev.y;
        const deltaT = tempo - prev.tempo;

        if (deltaT > 0 && deltaT < 1) {
          // Distância euclidiana em metros
          const distancia = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
          
          // Descartar teleporte anômalo por perda de tracking ótico (> 12 m/s = 43.2 km/h)
          const vInstantanea = distancia / deltaT;
          if (vInstantanea > 12.0) {
            estadoAnterior[id] = { ...prev, x, y, tempo };
            continue;
          }

          met.distanciaTotal += distancia;
          met.tempoTotalSegundos += deltaT;

          // Filtro passa-baixas / EMA para suavizar jitter de 25Hz
          const vFiltrada = 0.7 * vInstantanea + 0.3 * prev.vFiltrada;
          const vKmh = vFiltrada * 3.6;

          // Velocidade Máxima registrada pelo atleta
          const vKmhInstantanea = vInstantanea * 3.6;
          if (vKmhInstantanea > met.velocidadeMaxima) {
            met.velocidadeMaxima = vKmhInstantanea;
          }

          // Zonas de Velocidade (4 faixas legadas e 5 faixas padronizadas do TCC)
          if (vKmh <= 7.2) {
            met.distanciaAndando += distancia;
            met.distanciaZ1Caminhada += distancia;
          } else if (vKmh <= 14.4) {
            met.distanciaTrotando += distancia;
            met.distanciaZ2Trote += distancia;
          } else if (vKmh <= 19.8) {
            met.distanciaCorrendo += distancia;
            met.distanciaZ3Media += distancia;
          } else if (vKmh <= 25.2) {
            met.distanciaSprint += distancia;
            met.distanciaZ4HSR += distancia;
          } else {
            met.distanciaSprint += distancia;
            met.distanciaZ5Sprint += distancia;
          }

          // Detecção de Esforço de Sprint (> 19.8 km/h e picos de ouro > 25.2 km/h)
          const isSprinting = vKmh > 19.8;
          if (isSprinting && (!prev.emSprint || (tempo - prev.tempoUltimoSprint > 1.2))) {
            met.sprintsContagem++;
            prev.tempoUltimoSprint = tempo;
          }
          if (vKmh > 25.2 && (!prev.emSprint || (tempo - prev.tempoUltimoSprint > 1.2))) {
            met.sprintsPicosContagem = (met.sprintsPicosContagem || 0) + 1;
          }

          // Aceleração escalar suavizada (m/s²)
          let a = (vFiltrada - prev.vFiltrada) / deltaT;
          // Limite fisiológico humano no futebol (-7.0 m/s² a +6.0 m/s²)
          if (a > 6.0) a = 6.0;
          if (a < -7.0) a = -7.0;

          // Picos fisiológicos
          if (a > met.aceleracaoMaxima) {
            met.aceleracaoMaxima = a;
          }
          if (a < met.desaceleracaoMaxima) {
            met.desaceleracaoMaxima = a;
          }

          // Player Load: estresse inercial cumulativo
          const vx = deltaX / deltaT;
          const vy = deltaY / deltaT;
          const ax = (vx - prev.vx) / deltaT;
          const ay = (vy - prev.vy) / deltaT;
          const instPL = Math.min(1.5, Math.sqrt(ax * ax + ay * ay) * deltaT * 0.15);
          met.playerLoad += instPL;

          // Detecção de Acelerações Altas e Explosivas (com histerese e refratário)
          const isAcelerandoAlto = a >= 2.5;
          if (isAcelerandoAlto) {
            met.distanciaAcelerando += distancia;
            if (!prev.emAceleracaoAlta || (tempo - prev.tempoUltimaAcelAlta > 1.5)) {
              met.aceleracoesAltas++;
              if (a >= 3.0) met.aceleracoesExplosivas++;
              prev.tempoUltimaAcelAlta = tempo;
            }
          }

          // Detecção de Desacelerações Altas e Críticas (com histerese e refratário)
          const isDesacelerandoAlto = a <= -2.5;
          if (isDesacelerandoAlto) {
            met.distanciaDesacelerando += distancia;
            if (!prev.emDesaceleracaoAlta || (tempo - prev.tempoUltimaDesacelAlta > 1.5)) {
              met.desaceleracoesAltas++;
              if (a <= -3.0) met.desaceleracoesCriticas++;
              prev.tempoUltimaDesacelAlta = tempo;
            }
          }

          // Segmentação Temporal em Blocos de 15 minutos (0 a 5)
          const blocoIdx = Math.min(5, Math.max(0, Math.floor(tempo / 900)));
          const bloco = item.blocos[blocoIdx];
          bloco.distancia += distancia;
          bloco.tempoSegundos += deltaT;
          if (vKmhInstantanea > bloco.velocidadeMaxima) {
            bloco.velocidadeMaxima = vKmhInstantanea;
          }
          if (vKmh > 19.8 && vKmh <= 25.2) {
            bloco.distanciaHSR += distancia;
          } else if (vKmh > 25.2) {
            bloco.distanciaSprint += distancia;
            bloco.distanciaHSR += distancia;
          }
          if (isSprinting && (!prev.emSprint || (tempo - prev.tempoUltimoSprint > 1.2))) {
            bloco.sprintsContagem++;
          }
          if (isAcelerandoAlto && (!prev.emAceleracaoAlta || (tempo - prev.tempoUltimaAcelAlta > 1.5))) {
            bloco.aceleracoesAltas++;
          }

          // Segmentação 1º Tempo vs 2º Tempo
          const isPrimeiroTempo = periodo === 1 || tempo < 2700;
          const tempoAcc = isPrimeiroTempo ? item.tempo1 : item.tempo2;
          tempoAcc.distancia += distancia;
          tempoAcc.tempoSegundos += deltaT;
          if (vKmh > 19.8) {
            tempoAcc.hsr += distancia;
          }
          if (isSprinting && (!prev.emSprint || (tempo - prev.tempoUltimoSprint > 1.2))) {
            tempoAcc.sprints++;
          }

          // Potência Metabólica (Metabolic Power - Di Prampero & Osgnach, 2010)
          let custoEnergetico = 3.6; // Custo basal de corrida em linha reta plana
          if (a > 0) {
            custoEnergetico += 0.102 * (a * a) + 0.28 * a;
          } else if (a < 0) {
            custoEnergetico = Math.max(1.0, 3.6 + 0.18 * a);
          }
          const potenciaMetabolica = custoEnergetico * vFiltrada; // W/kg
          item.somaPotenciaMetabolicaPonderada += potenciaMetabolica * deltaT;

          // High Power Metabolic Distance (HPMD > 20 W/kg)
          if (potenciaMetabolica > 20) {
            met.distanciaAltaPotenciaMetabolica += distancia;
          }

          // Atualiza estado anterior
          estadoAnterior[id] = {
            x,
            y,
            tempo,
            vx,
            vy,
            vFiltrada,
            tempoUltimaAcelAlta: prev.tempoUltimaAcelAlta,
            tempoUltimaDesacelAlta: prev.tempoUltimaDesacelAlta,
            tempoUltimoSprint: prev.tempoUltimoSprint,
            emAceleracaoAlta: isAcelerandoAlto,
            emDesaceleracaoAlta: isDesacelerandoAlto,
            emSprint: isSprinting
          };
        } else {
          estadoAnterior[id] = {
            ...prev,
            x,
            y,
            tempo
          };
        }
      } else {
        // Primeiro frame do jogador
        estadoAnterior[id] = {
          x,
          y,
          tempo,
          vx: 0,
          vy: 0,
          vFiltrada: 0,
          tempoUltimaAcelAlta: 0,
          tempoUltimaDesacelAlta: 0,
          tempoUltimoSprint: 0,
          emAceleracaoAlta: false,
          emDesaceleracaoAlta: false,
          emSprint: false
        };
      }
    }
  }

  // Pós-processamento dos acumuladores e cálculo de médias
  return Object.values(acumuladores).map((item) => {
    const met = item.metrica;

    // Velocidade Média
    if (met.tempoTotalSegundos > 0) {
      met.velocidadeMedia = (met.distanciaTotal / met.tempoTotalSegundos) * 3.6;
      met.metrosPorMinuto = (met.distanciaTotal / met.tempoTotalSegundos) * 60;
      met.potenciaMetabolicaMedia = item.somaPotenciaMetabolicaPonderada / met.tempoTotalSegundos;
    }

    // Distância Média por Sprint
    if (met.sprintsContagem > 0) {
      met.distanciaMediaSprint = met.distanciaSprint / met.sprintsContagem;
    }

    // Centroide e Dispersão Espacial (Raio de Ação)
    if (item.numAmostrasValidas > 0) {
      const meanX = item.somaX / item.numAmostrasValidas;
      const meanY = item.somaY / item.numAmostrasValidas;
      met.centroideX = Math.round(meanX * 10) / 10;
      met.centroideY = Math.round(meanY * 10) / 10;

      const varX = item.somaX2 / item.numAmostrasValidas - meanX * meanX;
      const varY = item.somaY2 / item.numAmostrasValidas - meanY * meanY;
      met.raioAcao = Math.round(Math.sqrt(Math.max(0, varX) + Math.max(0, varY)) * 10) / 10;

      met.posicaoSugerida = inferirPosicaoTatica(met.centroideX, met.centroideY);
    }

    // Normalizar arredondamentos para precisão limpa
    met.minutosJogados = Math.round((met.tempoTotalSegundos / 60) * 10) / 10;
    met.distanciaTotal = Math.round(met.distanciaTotal * 10) / 10;
    met.distanciaZ1Caminhada = Math.round((met.distanciaZ1Caminhada || 0) * 10) / 10;
    met.distanciaZ2Trote = Math.round((met.distanciaZ2Trote || 0) * 10) / 10;
    met.distanciaZ3Media = Math.round((met.distanciaZ3Media || 0) * 10) / 10;
    met.distanciaZ4HSR = Math.round((met.distanciaZ4HSR || 0) * 10) / 10;
    met.distanciaZ5Sprint = Math.round((met.distanciaZ5Sprint || 0) * 10) / 10;
    met.velocidadeMaxima = Math.round(met.velocidadeMaxima * 10) / 10;
    met.velocidadeMedia = Math.round(met.velocidadeMedia * 10) / 10;
    met.metrosPorMinuto = Math.round(met.metrosPorMinuto * 10) / 10;
    met.tempoTotalSegundos = Math.round(met.tempoTotalSegundos * 10) / 10;
    met.distanciaAndando = Math.round(met.distanciaAndando * 10) / 10;
    met.distanciaTrotando = Math.round(met.distanciaTrotando * 10) / 10;
    met.distanciaCorrendo = Math.round(met.distanciaCorrendo * 10) / 10;
    met.distanciaSprint = Math.round(met.distanciaSprint * 10) / 10;
    met.distanciaAcelerando = Math.round(met.distanciaAcelerando * 10) / 10;
    met.distanciaDesacelerando = Math.round(met.distanciaDesacelerando * 10) / 10;
    met.aceleracaoMaxima = Math.round(met.aceleracaoMaxima * 100) / 100;
    met.desaceleracaoMaxima = Math.round(met.desaceleracaoMaxima * 100) / 100;
    met.playerLoad = Math.round(met.playerLoad * 10) / 10;
    met.distanciaMediaSprint = Math.round(met.distanciaMediaSprint * 10) / 10;
    met.potenciaMetabolicaMedia = Math.round(met.potenciaMetabolicaMedia * 10) / 10;
    met.distanciaAltaPotenciaMetabolica = Math.round(met.distanciaAltaPotenciaMetabolica * 10) / 10;

    // Pós-processamento dos Blocos Temporais (15 minutos)
    const rotulosBlocos = ["0-15'", "15-30'", "30-45'", "45-60'", "60-75'", "75-90'+"];
    let picoMmin = 0;

    const blocosFormatados: BlocoTemporal[] = item.blocos.map((b, idx) => {
      const mMin = b.tempoSegundos > 0 ? (b.distancia / b.tempoSegundos) * 60 : 0;
      if (mMin > picoMmin) picoMmin = mMin;
      return {
        indice: idx,
        rotulo: rotulosBlocos[idx],
        tempoInicioMinutos: idx * 15,
        tempoFimMinutos: (idx + 1) * 15,
        distanciaTotal: Math.round(b.distancia * 10) / 10,
        metrosPorMinuto: Math.round(mMin * 10) / 10,
        distanciaHSR: Math.round(b.distanciaHSR * 10) / 10,
        distanciaSprint: Math.round(b.distanciaSprint * 10) / 10,
        sprintsContagem: b.sprintsContagem,
        velocidadeMaxima: Math.round(b.velocidadeMaxima * 10) / 10,
        aceleracoesAltas: b.aceleracoesAltas,
        decaimentoPercentual: 0,
        classificacao: 'estavel'
      };
    });

    let primeiroBlocoQueda = '';
    let maiorQuedaPercentual = 0;

    blocosFormatados.forEach((b) => {
      if (picoMmin > 0) {
        b.decaimentoPercentual = Math.round(((b.metrosPorMinuto - picoMmin) / picoMmin) * 1000) / 10;
      }
      if (b.metrosPorMinuto >= picoMmin * 0.95 && picoMmin > 0) {
        b.classificacao = 'pico';
      } else if (b.decaimentoPercentual >= -10) {
        b.classificacao = 'estavel';
      } else if (b.decaimentoPercentual >= -20) {
        b.classificacao = 'queda-moderada';
        if (!primeiroBlocoQueda && b.indice > 0 && b.distanciaTotal > 0) primeiroBlocoQueda = b.rotulo;
        if (Math.abs(b.decaimentoPercentual) > maiorQuedaPercentual) {
          maiorQuedaPercentual = Math.abs(b.decaimentoPercentual);
        }
      } else {
        b.classificacao = 'queda-severa';
        if (!primeiroBlocoQueda && b.indice > 0 && b.distanciaTotal > 0) primeiroBlocoQueda = b.rotulo;
        if (Math.abs(b.decaimentoPercentual) > maiorQuedaPercentual) {
          maiorQuedaPercentual = Math.abs(b.decaimentoPercentual);
        }
      }
    });

    met.blocosTemporais = blocosFormatados;

    // 1º Tempo vs 2º Tempo
    const mMinT1 = item.tempo1.tempoSegundos > 0 ? (item.tempo1.distancia / item.tempo1.tempoSegundos) * 60 : 0;
    const mMinT2 = item.tempo2.tempoSegundos > 0 ? (item.tempo2.distancia / item.tempo2.tempoSegundos) * 60 : 0;
    met.analisePrimeiroTempo = {
      distancia: Math.round(item.tempo1.distancia * 10) / 10,
      metrosPorMinuto: Math.round(mMinT1 * 10) / 10,
      hsr: Math.round(item.tempo1.hsr * 10) / 10,
      sprints: item.tempo1.sprints
    };
    met.analiseSegundoTempo = {
      distancia: Math.round(item.tempo2.distancia * 10) / 10,
      metrosPorMinuto: Math.round(mMinT2 * 10) / 10,
      hsr: Math.round(item.tempo2.hsr * 10) / 10,
      sprints: item.tempo2.sprints
    };
    met.decaimentoSegundoTempoPercentual = mMinT1 > 0 ? Math.round(((mMinT2 - mMinT1) / mMinT1) * 1000) / 10 : 0;

    const momentoQueda = primeiroBlocoQueda || (met.decaimentoSegundoTempoPercentual < -12 ? 'No 2º Tempo' : 'Intensidade Mantida');
    let tipoFadiga = 'Pacing Estável (Intensidade Homogênea)';
    let recomendacao = 'Atleta manteve distribuição homogênea de esforço. Excelente capacidade de tolerância neuromuscular e pacing.';
    let gravidade: 'normal' | 'alerta' | 'critico' = 'normal';

    if (maiorQuedaPercentual >= 25 || (met.decaimentoSegundoTempoPercentual && met.decaimentoSegundoTempoPercentual <= -22)) {
      tipoFadiga = 'Fadiga Cumulativa Severa (Queda Acentuada)';
      recomendacao = `Queda acentuada de ${maiorQuedaPercentual.toFixed(1)}% detectada (${momentoQueda}). Recomenda-se substituição prioritária por volta dos 65-70 min para preservar o bloco defensivo e evitar lesões musculares.`;
      gravidade = 'critico';
    } else if (maiorQuedaPercentual >= 15 || (met.decaimentoSegundoTempoPercentual && met.decaimentoSegundoTempoPercentual <= -12)) {
      tipoFadiga = 'Fadiga Moderada / Queda de Final de Partida';
      recomendacao = `Redução perceptível de intensidade no bloco ${momentoQueda}. Monitorar hidratação, tempo de recuperação entre tiros e considerar substituição tática.`;
      gravidade = 'alerta';
    }

    met.momentoQuedaIntensidade = momentoQueda;
    met.diagnosticoFadiga = {
      tipo: tipoFadiga,
      momentoQueda,
      quedaPercentual: maiorQuedaPercentual,
      recomendacaoComissao: recomendacao,
      gravidade
    };

    return met;
  });
}
