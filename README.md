# Visão 90: Back-end e Motor Cinemático

> **Projeto Integrado:** Este repositório contém o back-end e o motor de cálculo cinemático da plataforma **Visão 90**.
> Para a documentação completa do projeto, contextualização científica, dados de rastreamento e artigo do TCC, acesse o repositório unificado:
> 🔗 **[Repositório Principal - Visão 90](https://github.com/Durigueto/visao90)**
>
> Front-end da aplicação: 🔗 **[tcc-frontend](https://github.com/Durigueto/tcc-frontend)**

---

## 1. Visão Geral

API desenvolvida em **Node.js com TypeScript** (Next.js) responsável pelo pipeline de ingestão, sanitização e processamento de matrizes de coordenadas ópticas a 25 Hz da Metrica Sports.

### Funcionalidades do Motor:
* **Conversão Métrica:** Conversão de coordenadas $[0, 1]$ para dimensões oficiais da FIFA ($105,0\text{ m} \times 68,0\text{ m}$).
* **Zonas Metabólicas:** Estratificação em 5 faixas (Caminhada Z1 a Sprint Puro Z5).
* **Dinâmica Inercial:** Contagem de acelerações e desacelerações bruscas ($\ge 2,5\text{ m/s}^2$ e $\le -2,5\text{ m/s}^2$) e estresse acumulado (*Player Load*).
* **Análise de Fadiga:** Decomposição temporal contínua em blocos de 15 minutos e diagnóstico de queda de rendimento (*fade-out* neuromuscular).

## 2. Tecnologias Utilizadas

* **Linguagem:** TypeScript
* **Ambiente & Framework:** Node.js com Next.js (API Routes)
* **Banco de Dados:** Supabase / PostgreSQL
* **Testes Automatizados:** Vitest

## 3. Como Executar Localmente

### Pré-requisitos
* Node.js (versão 18 ou superior).

```bash
# 1. Instalar dependências
npm install

# 2. Iniciar servidor da API
npm run dev
```

A API estará respondendo em: `http://localhost:3000`

### Executar Testes Unitários:
```bash
npm run test
```

## 4. Dataset de Amostragem

O arquivo oficial da Metrica Sports para testes imediatos sem necessidade de download externo encontra-se em:
* `dados/dados_rastreamento_exemplo.csv` (32,9 MB)
