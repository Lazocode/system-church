/**
 * ============================================================================
 * CONSTANTES GLOBAIS E CONFIGURAÇÕES DO SISTEMA
 * ============================================================================
 * Centraliza listas de opções, categorias pré-definidas, credenciais de acesso
 * e a paleta de cores institucional utilizada nos gráficos analíticos.
 */

/**
 * Códigos de acesso para autenticação dos papéis de usuário.
 * 
 * Por padrão, utilizam variáveis de ambiente (VITE_ACCESS_CODE_ADMIN e VITE_ACCESS_CODE_TESOURARIA).
 * Caso não estejam definidas no ambiente, são fornecidos valores padrão para permitir testes imediatos.
 */
export const ACCESS_CODES: { admin: string; tesouraria: string } = {
  admin: import.meta.env.VITE_ACCESS_CODE_ADMIN || 'admin',
  tesouraria: import.meta.env.VITE_ACCESS_CODE_TESOURARIA || 'tesouraria',
};

/**
 * Lista de ministérios e departamentos oficiais da igreja.
 * Utilizado nos formulários de cadastro de membros e filtros de pesquisa.
 */
export const MINISTRIES: string[] = [
  'Louvor',
  'Infantil',
  'Jovens',
  'Diaconia',
  'Intercessão',
  'Recepção',
  'Outro',
];

/**
 * Categorias oficiais de receitas (entradas financeiras).
 * Utilizado para classificação de dízimos, ofertas e doações.
 */
export const INCOME_CATEGORIES: string[] = [
  'Dízimo',
  'Oferta',
  'Doação especial',
  'Evento',
  'Outros',
];

/**
 * Categorias oficiais de despesas (saídas financeiras).
 * Utilizado para controle de custos de manutenção, serviços, salários e obras missionárias.
 */
export const EXPENSE_CATEGORIES: string[] = [
  'Manutenção',
  'Serviços',
  'Missões',
  'Ação social',
  'Salários',
  'Outros',
];

/**
 * Paleta de cores institucional para gráficos (Recharts) e elementos visuais.
 * Tons nobres e clássicos adequados à identidade visual da congregação.
 * - #B8863B: Dourado fosco (ouro eclesiástico)
 * - #4B6656: Verde botânico (receitas / entradas)
 * - #A6432D: Terracota suave (despesas / saídas)
 * - #34456B: Azul marinho clássico (destaque e títulos)
 * - #8A7355: Bronze suave (categorias secundárias)
 * - #6B6B63: Cinza neutro quente (apoio e bordas)
 */
export const PALETTE: string[] = [
  '#B8863B',
  '#4B6656',
  '#A6432D',
  '#34456B',
  '#8A7355',
  '#6B6B63',
];

