export const fmtBRL = (n: number): string =>
  (Number(n) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const monthLabel = (ym: string): string => {
  const [y, m] = ym.split('-');
  const names = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  return `${names[parseInt(m, 10) - 1]}/${y.slice(2)}`;
};

export const uid = (): string => Math.random().toString(36).slice(2, 10);
