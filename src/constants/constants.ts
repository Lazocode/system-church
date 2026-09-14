// ---------------------------------------------------------------------------
// Códigos de acesso — vêm do arquivo .env (não vão pro GitHub).
// Veja o .env.example e o README para configurar os seus.
// ---------------------------------------------------------------------------
export const ACCESS_CODES: { admin: string; tesouraria: string } = {
  admin: import.meta.env.VITE_ACCESS_CODE_ADMIN ?? '',
  tesouraria: import.meta.env.VITE_ACCESS_CODE_TESOURARIA ?? '',
};

export const MINISTRIES: string[] = ['Louvor', 'Infantil', 'Jovens', 'Diaconia', 'Intercessão', 'Recepção', 'Outro'];
export const INCOME_CATEGORIES: string[] = ['Dízimo', 'Oferta', 'Doação especial', 'Evento', 'Outros'];
export const EXPENSE_CATEGORIES: string[] = ['Manutenção', 'Serviços', 'Missões', 'Ação social', 'Salários', 'Outros'];
export const PALETTE: string[] = ['#B8863B', '#4B6656', '#A6432D', '#34456B', '#8A7355', '#6B6B63'];
