import { describe, it, expect } from 'vitest';
import { processarRastreamento } from './algoritmoRastreamento';

describe('Algoritmo de Rastreamento Esportivo Avançado', () => {
  it('deve calcular corretamente cinemática, zonas de velocidade, acelerações e centroide', () => {
    // Simulação com 3 frames (2 intervalos de 0.04s cada, total 0.08s)
    // Frame 1: (0.500, 0.500)
    // Frame 2: (0.504, 0.500) -> DeltaX = 0.004 * 105 = 0.42m. v = 0.42 / 0.04 = 10.5 m/s (37.8 km/h)
    // Frame 3: (0.504, 0.500) -> DeltaX = 0m. v = 0 m/s. Desaceleração brusca de 10.5 m/s para 0 em 0.04s: a = -262.5 m/s²
    const mockCsv = `
,,,Home,,
,,,11,,
Period,Frame,Time [s],Player11_X,Player11_Y
1,1,0.00,0.500,0.500
1,2,0.04,0.504,0.500
1,3,0.08,0.504,0.500
`;

    const metricas = processarRastreamento(mockCsv.trim());

    expect(metricas.length).toBe(1);
    const jogador = metricas[0];

    expect(jogador.id).toBe('11');
    expect(jogador.distanciaTotal).toBeCloseTo(0.42, 1);
    expect(jogador.velocidadeMaxima).toBeCloseTo(37.8, 1);
    expect(jogador.velocidadeMedia).toBeGreaterThan(0);
    expect(jogador.metrosPorMinuto).toBeGreaterThan(0);

    // Zonas de Velocidade
    expect(jogador.distanciaSprint).toBeCloseTo(0.42, 1);

    // Sprint Bouts (teve 1 tiro de sprint)
    expect(jogador.sprintsContagem).toBe(1);

    // Desaceleração Alta (ocorreu no frame 3)
    expect(jogador.desaceleracoesAltas).toBeGreaterThanOrEqual(1);

    // Centroide Espacial
    expect(jogador.centroideX).toBeGreaterThan(50);
    expect(jogador.centroideY).toBeCloseTo(34, 1);
    expect(jogador.posicaoSugerida).toBeDefined();
    expect(jogador.amostrasPosicao).toBeDefined();

    // Blocos Temporais e Fadiga
    expect(jogador.blocosTemporais).toBeDefined();
    expect(jogador.blocosTemporais?.length).toBe(6);
    expect(jogador.blocosTemporais?.[0].rotulo).toBe("0-15'");
    expect(jogador.analisePrimeiroTempo).toBeDefined();
    expect(jogador.analiseSegundoTempo).toBeDefined();
    expect(jogador.diagnosticoFadiga).toBeDefined();
    expect(jogador.diagnosticoFadiga?.tipo).toBeDefined();
    expect(jogador.diagnosticoFadiga?.recomendacaoComissao).toBeDefined();
  });
});
