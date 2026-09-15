/**
 * ============================================================================
 * UTILITÁRIOS GERAIS E FORMATADORES
 * ============================================================================
 * Contém funções auxiliares puras para formatação de moeda brasileira (BRL),
 * rótulos amigáveis de datas e geração de identificadores únicos (IDs).
 */

/**
 * Formata um valor numérico para a moeda brasileira (Real - R$).
 * Exemplo: 1250.5 -> "R$ 1.250,50"
 *
 * @param n Valor monetário a ser formatado
 * @returns String formatada no padrão pt-BR
 */
export const fmtBRL = (n: number): string =>
  (Number(n) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

/**
 * Converte uma chave de ano/mês no formato "AAAA-MM" para um rótulo curto legível.
 * Exemplo: "2026-03" -> "Mar/26"
 *
 * @param ym String no formato "AAAA-MM"
 * @returns Rótulo amigável com mês abreviado e ano de dois dígitos
 */
export const monthLabel = (ym: string): string => {
  const [y, m] = ym.split('-');
  const names = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const monthIndex = parseInt(m, 10) - 1;
  const monthName = names[monthIndex] || m;
  const shortYear = y ? y.slice(2) : '';
  return `${monthName}/${shortYear}`;
};

/**
 * Converte uma chave de ano/mês no formato "AAAA-MM" para o nome completo do mês e ano.
 * Exemplo: "2026-03" -> "Março de 2026"
 *
 * @param ym String no formato "AAAA-MM"
 * @returns Rótulo completo em português
 */
export const fullMonthLabel = (ym: string): string => {
  const [y, m] = ym.split('-');
  const names = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ];
  const idx = parseInt(m, 10) - 1;
  return `${names[idx] || m} de ${y}`;
};

/**
 * Gera um identificador único pseudo-aleatório de 8 caracteres alfanuméricos.
 * Útil para novos registros criados localmente antes da persistência definitiva.
 *
 * @returns Identificador curto (ex: "k7x9p2m4")
 */
export const uid = (): string => Math.random().toString(36).slice(2, 10);

