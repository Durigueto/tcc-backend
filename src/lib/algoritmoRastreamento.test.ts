import { describe, it, expect } from 'vitest';
import { processarRastreamento } from './algoritmoRastreamento';

describe('Algoritmo de Rastreamento', () => {
  it('deve calcular corretamente distâncias e velocidades a partir do CSV em memória', () => {
    // Um CSV simulado de 2 segundos de movimento.
    // 1 frame por segundo para facilitar as contas.
    // Jogador 11 se move de (X=0.5, Y=0.5) para (X=0.6, Y=0.5) no primeiro segundo,
    // e depois para (X=0.6, Y=0.6) no segundo segundo.
    
    // Coordenada X * 105m: (0.5 * 105 = 52.5) -> (0.6 * 105 = 63.0). Delta X = 10.5m
    // Coordenada Y * 68m: (0.5 * 68 = 34.0) -> (0.6 * 68 = 40.8). Delta Y = 6.8m
    
    // 25 frames por segundo = 0.04s por frame
    // Se Delta T = 0.04, para ter velocidade 10.5 m/s (37.8 km/h), Delta X = 10.5 * 0.04 = 0.42m
    // 0.42m / 105m = 0.004 no arquivo CSV.
    // Assim vamos simular o frame 1 e frame 2 com DeltaT de 0.04
    
    // Frame 1: X=0.5
    // Frame 2: X=0.504 -> (0.004 * 105 = 0.42m)
    
    const mockCsv = `
,,,Home,,
,,,11,,
Period,Frame,Time [s],Player11_X,Player11_Y
1,1,0.00,0.500,0.500
1,2,0.04,0.504,0.500
`;

    const metricas = processarRastreamento(mockCsv.trim());

    expect(metricas.length).toBe(1);
    const jogador = metricas[0];
    
    expect(jogador.id).toBe('11');
    expect(jogador.distanciaTotal).toBeCloseTo(0.42, 2);
    expect(jogador.velocidadeMaxima).toBeCloseTo(37.8, 1);
    
    // Zonas de Velocidade
    expect(jogador.distanciaAndando).toBe(0);
    expect(jogador.distanciaTrotando).toBe(0);
    expect(jogador.distanciaCorrendo).toBe(0);
    expect(jogador.distanciaSprint).toBeCloseTo(0.42, 2);
  });
});
