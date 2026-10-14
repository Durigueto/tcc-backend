# Visão 90: Back-end e Motor Cinemático de Rastreamento

Módulo de processamento de dados e API da plataforma **Visão 90**, desenvolvido como parte do Trabalho de Conclusão de Curso (TCC) em Ciência da Computação por João Pedro Dias, sob orientação do Prof. Me. Kenedy Antônio Freitas.

---

## 1. Visão Geral do Back-end

O back-end do Visão 90 é responsável pela ingestão, higienização, conversão métrica e processamento algorítmico de dados brutos de rastreamento óptico bidimensional (*tracking data*) capturados à taxa de amostragem de 25 Hz (25 quadros por segundo).

### Responsabilidades do Motor:
* **Conversão Espacial Cartesiana:** Converte coordenadas adimensionais normalizadas no intervalo $[0, 1]$ para as dimensões métricas oficiais do campo da FIFA ($105,0\text{ m} \times 68,0\text{ m}$).
* **Filtragem de Jitter e Ruído Óptico:** Aplicação de filtro passa-baixas e Média Móvel Exponencial (EMA) para suavizar descontinuidades de rastreamento por vídeo e descartar anomalias espúrias superiores a 12,0 m/s (43,2 km/h).
* **Estratificação nas 5 Zonas Metabólicas:** Separação do volume percorrido em Z1 (Caminhada < 7,2 km/h), Z2 (Trote 7,2 a 14,4 km/h), Z3 (Média 14,4 a 19,8 km/h), Z4 (Alta Intensidade HSR 19,8 a 25,2 km/h) e Z5 (Sprint Puro > 25,2 km/h).
* **Cálculo da Dinâmica Inercial:** Detecção de eventos discretos de aceleração e desaceleração brusca ($\ge 2,5\text{ m/s}^2$ e $\le -2,5\text{ m/s}^2$) e pico de carga mecânica (*Player Load*).
* **Decomposição Temporal em Blocos de 15 Minutos:** Análise da dinâmica de fadiga e diagnóstico de perda de intensidade na etapa final da partida (*fade-out* neuromuscular).

---

## 2. Tecnologias Utilizadas

* **Linguagem:** [TypeScript](https://www.typescriptlang.org/) com tipagem estática rigorosa.
* **Ambiente de Execução:** [Node.js](https://nodejs.org/) com framework [Next.js](https://nextjs.org/) (API Routes).
* **Camada de Persistência:** [Supabase](https://supabase.com/) com banco de dados relacional PostgreSQL.
* **Framework de Testes:** [Vitest](https://vitest.dev/).

---

## 3. Instruções de Instalação e Execução

### Pré-requisitos
* Node.js instalado (versão 18 ou superior).

### Instalação de dependências:
```bash
npm install
```

### Inicialização do servidor da API:
```bash
npm run dev
```

A API estará respondendo em:
👉 `http://localhost:3000`

### Execução da suíte de testes automatizados:
```bash
npm run test
```

Os testes unitários validam a integridade matemática das equações cinemáticas, o cálculo da distância euclidiana, a alocação correta nas zonas de velocidade e o algoritmo de fadiga em blocos temporais.

---

## 4. Estrutura do Dataset de Rastreamento (Metrica Sports)

Na pasta `dados/` encontra-se o arquivo oficial de demonstração:
* `dados/dados_rastreamento_exemplo.csv` (32,9 MB)

O arquivo possui a seguinte estrutura padronizada:
* **Linha 1:** Identificação da equipe (`Home` ou `Away`).
* **Linha 2:** Numeração identificadora dos atletas (`11`, `1`, `2`, `3`...).
* **Linha 3:** Cabeçalho das colunas (`Period`, `Frame`, `Time [s]`, `Player11_X`, `Player11_Y`...).
* **Linhas subsequentes:** Registros a cada 0,04 segundos com o tempo decorrido e as posições normalizadas dos atletas em campo.

O sistema também aceita qualquer arquivo oficial de rastreamento com a mesma estrutura obtido a partir do repositório público da [Metrica Sports](https://github.com/metrica-sports/sample-data).

---

## 5. Estrutura dos Arquivos

```text
tcc-backend/
├── dados/
│   └── dados_rastreamento_exemplo.csv  # Dataset oficial de amostragem
├── package.json                        # Dependências e scripts
├── vitest.config.ts                    # Configuração de testes unitários
└── src/
    ├── app/
    │   └── api/
    │       └── rastreamento/
    │           └── route.ts            # Endpoint HTTP POST para upload e processamento
    └── lib/
        ├── algoritmoRastreamento.ts    # Motor matemático de cinemática e zonas
        ├── algoritmoRastreamento.test.ts # Testes automatizados do motor
        └── clienteSupabase.ts          # Conexão e persistência relacional
```
