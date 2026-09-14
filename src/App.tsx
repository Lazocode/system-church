/**
 * ============================================================================
 * COMPONENTE PRINCIPAL (APP)
 * ============================================================================
 * Ponto central de orquestração do sistema de gestão eclesiástica (IECVK):
 * - Controle do estado de autenticação e papel do usuário ('admin' ou 'tesouraria').
 * - Roteamento interno entre as páginas: 'dashboard', 'members' e 'finance'.
 * - Carregamento inicial assíncrono dos dados da igreja (membros e finanças).
 * - Sincronização e persistência otimista de dados (persistMembers e persistFinance).
 * - Exibição condicional de tela de login, barra lateral (Sidebar), barra superior (TopBar)
 *   e alertas globais de erro ou carregamento.
 */

import { useState, useEffect, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { getData, setData } from './services/storage';
import Login from './components/shared/Login';
import Sidebar from './components/layout/Sidebar';
import TopBar from './components/layout/TopBar';
import Dashboard from './components/dashboard/Dashboard';
import Members from './components/shared/Members';
import Finance from './components/shared/Finance';
import type { Member, FinanceEntry, Role } from './types/types';

/** Tipos de páginas disponíveis no sistema */
type Page = 'dashboard' | 'members' | 'finance';

/**
 * Componente raiz da aplicação.
 */
export default function App() {
  // --------------------------------------------------------------------------
  // ESTADOS GLOBAIS DE AUTENTICAÇÃO E NAVEGAÇÃO
  // --------------------------------------------------------------------------
  
  /** Papel do usuário logado (null indica que o usuário não está autenticado) */
  const [role, setRole] = useState<Role | null>(null);

  /** Página atualmente ativa no painel principal */
  const [page, setPage] = useState<Page>('dashboard');

  // --------------------------------------------------------------------------
  // ESTADOS DE DADOS (MEMBROS E FINANÇAS)
  // --------------------------------------------------------------------------

  /** Lista completa de membros cadastrados */
  const [members, setMembers] = useState<Member[]>([]);

  /** Lista completa de lançamentos financeiros do livro-caixa */
  const [finance, setFinance] = useState<FinanceEntry[]>([]);

  /** Indicador de carregamento assíncrono dos dados */
  const [dataLoading, setDataLoading] = useState(false);

  /** Mensagem de erro global de carregamento ou salvamento */
  const [dataError, setDataError] = useState('');

  // --------------------------------------------------------------------------
  // CARREGAMENTO E SINCRONIZAÇÃO DE DADOS
  // --------------------------------------------------------------------------

  /**
   * Carrega todos os registros de membros e finanças a partir da camada de armazenamento.
   */
  const loadAll = useCallback(async () => {
    setDataLoading(true);
    setDataError('');
    try {
      const [m, f] = await Promise.all([
        getData<Member>('church-members'),
        getData<FinanceEntry>('church-finance'),
      ]);
      setMembers(m);
      setFinance(f);
    } catch (e) {
      console.error('Erro ao carregar dados:', e);
      setDataError('Não foi possível carregar os dados. Tente novamente.');
    } finally {
      setDataLoading(false);
    }
  }, []);

  // Dispara o carregamento dos dados assim que o usuário faz login com sucesso
  useEffect(() => {
    if (role) {
      loadAll();
    }
  }, [role, loadAll]);

  /**
   * Atualiza a lista de membros no estado local e persiste no storage (Supabase/LocalStorage).
   */
  const persistMembers = async (next: Member[]) => {
    setMembers(next);
    const ok = await setData('church-members', next);
    if (!ok) {
      setDataError('Falha ao salvar os membros no banco de dados.');
    }
  };

  /**
   * Atualiza os lançamentos financeiros no estado local e persiste no storage.
   */
  const persistFinance = async (next: FinanceEntry[]) => {
    setFinance(next);
    const ok = await setData('church-finance', next);
    if (!ok) {
      setDataError('Falha ao salvar os lançamentos no banco de dados.');
    }
  };

  // --------------------------------------------------------------------------
  // RENDERIZAÇÃO CONDICIONAL
  // --------------------------------------------------------------------------

  // Se o usuário ainda não estiver autenticado, renderiza a tela de login
  if (!role) {
    return <Login onLogin={setRole} />;
  }

  return (
    <div className="min-h-screen w-full flex bg-[#F7F3EA] text-[#1B2A4A]">
      {/* Barra Lateral de Navegação */}
      <Sidebar
        role={role}
        page={page}
        setPage={setPage}
        onLogout={() => setRole(null)}
      />

      {/* Área Central de Conteúdo */}
      <main className="flex-1 min-h-screen overflow-y-auto">
        {/* Barra Superior com Saudação e Badge de Papel */}
        <TopBar role={role} />

        {/* Container Central com Limitação de Largura */}
        <div className="p-5 md:p-8 max-w-6xl mx-auto">
          {/* Mensagem de Erro Global (se houver) */}
          {dataError && (
            <div className="mb-5 rounded-lg border border-[#A6432D]/30 bg-[#A6432D]/10 text-[#A6432D] px-4 py-3 text-sm font-medium">
              {dataError}
            </div>
          )}

          {/* Feedback Visual de Carregamento */}
          {dataLoading ? (
            <div className="flex items-center gap-2.5 text-[#6B6B63] py-20 justify-center">
              <Loader2 className="animate-spin text-[#B8863B]" size={22} />
              <span className="text-sm font-medium">Carregando dados da congregação…</span>
            </div>
          ) : (
            <>
              {/* Página 1: Painel Analítico Geral */}
              {page === 'dashboard' && <Dashboard finance={finance} />}

              {/* Página 2: Gestão de Membros (Exclusivo para Administração) */}
              {page === 'members' && role === 'admin' && (
                <Members members={members} setMembers={persistMembers} />
              )}

              {/* Página 3: Livro-Caixa e Lançamentos Financeiros */}
              {page === 'finance' && (
                <Finance finance={finance} setFinance={persistFinance} />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

