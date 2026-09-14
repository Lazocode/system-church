/**
 * ============================================================================
 * SERVIÇO DE ARMAZENAMENTO E PERSISTÊNCIA DE DADOS (STORAGE SERVICE)
 * ============================================================================
 * Esta camada gerencia a leitura e escrita de dados da igreja (membros e finanças).
 *
 * ARQUITETURA HÍBRIDA RESILIENTE:
 * 1. PERSISTÊNCIA EM NUVEM (Supabase):
 *    - Quando as variáveis de ambiente do Supabase estão configuradas, as operações
 *      de leitura e gravação sincronizam diretamente com as tabelas na nuvem.
 * 2. FALLBACK LOCAL (LocalStorage):
 *    - Caso o Supabase não esteja configurado ou esteja temporariamente inacessível,
 *      o sistema opera 100% no LocalStorage do navegador.
 *    - Se for o primeiro acesso, o sistema semeia automaticamente dados iniciais
 *      de demonstração para que a interface não fique vazia.
 */

import { supabase, isSupabaseConfigured } from '../libs/supabaseClient';
import type { Member, FinanceEntry } from '../types/types';

/**
 * Mapeamento entre as chaves de identificação interna do app e os nomes reais
 * das tabelas no banco de dados Supabase (PostgreSQL).
 */
const TABLE_MAP: Record<string, string> = {
  'church-members': 'members',
  'church-finance': 'finance_entries',
};

/**
 * Registros de exemplo para membros, utilizados na inicialização da congregação.
 */
const INITIAL_MEMBERS: Member[] = [
  {
    id: 'm1',
    name: 'Pr. Carlos Eduardo Souza',
    phone: '(11) 98765-4321',
    email: 'carlos.pastor@igreja.org.br',
    address: 'Rua das Oliveiras, 120 - Centro',
    birthdate: '1980-05-14',
    ministry: 'Louvor',
    joinedDate: '2020-01-15',
    notes: 'Pastor titular e líder de ensino bíblico',
  },
  {
    id: 'm2',
    name: 'Ana Paula Ferreira',
    phone: '(11) 97654-3210',
    email: 'ana.paula@igreja.org.br',
    address: 'Av. Paulista, 850 - Bela Vista',
    birthdate: '1992-08-22',
    ministry: 'Infantil',
    joinedDate: '2021-03-10',
    notes: 'Professora da Escola Bíblica Infantil (EBD)',
  },
  {
    id: 'm3',
    name: 'Marcos Vinícius Lima',
    phone: '(11) 96543-2109',
    email: 'marcos.v@igreja.org.br',
    address: 'Rua São Bento, 44 - Apto 32',
    birthdate: '2001-11-03',
    ministry: 'Jovens',
    joinedDate: '2022-06-20',
    notes: 'Coordenação da mocidade e equipe de mídia',
  },
  {
    id: 'm4',
    name: 'Beatriz Helena Santos',
    phone: '(11) 95432-1098',
    email: 'beatriz.santos@igreja.org.br',
    address: 'Rua da Consolação, 310',
    birthdate: '1995-02-17',
    ministry: 'Recepção',
    joinedDate: '2023-02-01',
    notes: 'Equipe de acolhimento e boas-vindas aos visitantes',
  },
  {
    id: 'm5',
    name: 'Roberto de Oliveira',
    phone: '(11) 94321-0987',
    email: 'roberto.oliveira@igreja.org.br',
    address: 'Rua Bela Cintra, 1400',
    birthdate: '1978-09-30',
    ministry: 'Diaconia',
    joinedDate: '2019-08-11',
    notes: 'Diácono responsável pelo apoio logístico e santa ceia',
  },
];

/**
 * Registros de exemplo para o caixa financeiro, cobrindo entradas e saídas recentes.
 */
const INITIAL_FINANCE: FinanceEntry[] = [
  {
    id: 'f1',
    type: 'entrada',
    category: 'Dízimo',
    amount: 3200,
    date: '2026-01-10',
    description: 'Dízimos do culto de celebração de domingo',
  },
  {
    id: 'f2',
    type: 'saida',
    category: 'Manutenção',
    amount: 450,
    date: '2026-01-18',
    description: 'Reparo e calibração no sistema de som do templo',
  },
  {
    id: 'f3',
    type: 'entrada',
    category: 'Oferta',
    amount: 1150,
    date: '2026-01-25',
    description: 'Ofertas recolhidas nos cultos de celebração',
  },
  {
    id: 'f4',
    type: 'entrada',
    category: 'Dízimo',
    amount: 3850,
    date: '2026-02-08',
    description: 'Dízimos e contribuições mensais dos membros',
  },
  {
    id: 'f5',
    type: 'saida',
    category: 'Serviços',
    amount: 620,
    date: '2026-02-15',
    description: 'Contas de energia elétrica e internet do templo',
  },
  {
    id: 'f6',
    type: 'saida',
    category: 'Missões',
    amount: 800,
    date: '2026-02-22',
    description: 'Repasse mensal para base missionária conveniada',
  },
  {
    id: 'f7',
    type: 'entrada',
    category: 'Doação especial',
    amount: 1500,
    date: '2026-03-02',
    description: 'Doação voluntária para reforma das salas infantis',
  },
  {
    id: 'f8',
    type: 'entrada',
    category: 'Dízimo',
    amount: 4200,
    date: '2026-03-08',
    description: 'Dízimos arrecadados no primeiro domingo do mês',
  },
  {
    id: 'f9',
    type: 'saida',
    category: 'Ação social',
    amount: 550,
    date: '2026-03-10',
    description: 'Aquisição de cestas básicas para famílias assistidas',
  },
];

/**
 * Lê os registros do LocalStorage do navegador de forma segura.
 * Se o armazenamento estiver vazio, inicializa com a massa de dados padrão.
 *
 * @param key Chave de armazenamento (ex: 'church-members', 'church-finance')
 * @returns Array de registros tipados
 */
function getLocalData<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Aviso: Falha ao interpretar dados do localStorage:', e);
  }

  // Inicialização inicial caso não existam registros gravados
  if (key === 'church-members') {
    setLocalData(key, INITIAL_MEMBERS);
    return INITIAL_MEMBERS as unknown as T[];
  }
  if (key === 'church-finance') {
    setLocalData(key, INITIAL_FINANCE);
    return INITIAL_FINANCE as unknown as T[];
  }
  return [];
}

/**
 * Grava um array de registros serializado no LocalStorage do navegador.
 *
 * @param key Chave de armazenamento
 * @param value Lista de registros
 * @returns Booleano indicando sucesso da operação
 */
function setLocalData<T>(key: string, value: T[]): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.error('Erro ao gravar dados no localStorage:', e);
    return false;
  }
}

/**
 * Obtém a lista de registros de uma determinada coleção.
 * Tenta buscar primeiramente do Supabase; em caso de falha ou ausência
 * de credenciais, busca do armazenamento local do navegador.
 *
 * @param key Nome da entidade ('church-members' ou 'church-finance')
 * @returns Promise com a lista de itens
 */
export async function getData<T>(key: string): Promise<T[]> {
  const table = TABLE_MAP[key];

  // Tentativa de consulta via Supabase (se configurado)
  if (isSupabaseConfigured && supabase && table) {
    try {
      const { data, error } = await supabase.from(table).select('*');
      if (!error && data && data.length > 0) {
        // Mantém o cache local atualizado com a versão mais recente da nuvem
        setLocalData(key, data);
        return data as T[];
      }
      if (error) {
        console.warn(`Supabase offline ou tabela "${table}" indisponível: ${error.message}. Alternando para local.`);
      }
    } catch (e) {
      console.warn('Erro de rede ao conectar ao Supabase, alternando para local:', e);
    }
  }

  // Fallback para o armazenamento local
  return getLocalData<T>(key);
}

/**
 * Persiste uma lista inteira de registros na entidade indicada.
 * Salva no LocalStorage imediatamente e, se o Supabase estiver disponível,
 * sincroniza em segundo plano calculando diferenças (deletes e upserts).
 *
 * @param key Nome da entidade ('church-members' ou 'church-finance')
 * @param value Nova lista completa de registros
 * @returns Promise com booleano indicando status do salvamento local
 */
export async function setData<T extends { id: string }>(key: string, value: T[]): Promise<boolean> {
  const table = TABLE_MAP[key];
  
  // 1. Grava no cache local para resposta visual imediata (otimista)
  const localSuccess = setLocalData(key, value);

  // 2. Se o Supabase estiver ativo, sincroniza na nuvem
  if (isSupabaseConfigured && supabase && table) {
    try {
      // Identifica registros removidos comparando IDs prévios com os novos
      const { data: existing, error: fetchError } = await supabase.from(table).select('id');
      if (!fetchError) {
        const existingIds = (existing ?? []).map((r: { id: string }) => r.id);
        const newIds = value.map((v) => v.id);
        const idsToDelete = existingIds.filter((id) => !newIds.includes(id));

        // Remove do banco registros que foram excluídos na aplicação
        if (idsToDelete.length > 0) {
          await supabase.from(table).delete().in('id', idsToDelete);
        }

        // Insere ou atualiza os registros restantes
        if (value.length > 0) {
          await supabase.from(table).upsert(value);
        }
      }
    } catch (e) {
      console.warn('Supabase não respondeu durante a gravação; os dados foram mantidos localmente:', e);
    }
  }

  return localSuccess;
}


