/**
 * ============================================================================
 * BARRA LATERAL DE NAVEGAÇÃO (SIDEBAR)
 * ============================================================================
 * Gerencia a navegação entre as páginas do sistema:
 * - Painel (Dashboard): Visão geral analítica com gráficos e KPIs (todos os papéis).
 * - Membros (Members): Cadastro e listagem de membros (restrito a 'admin').
 * - Financeiro (Finance): Lançamento e conferência do livro-caixa (todos os papéis).
 * - Sair (Logout): Encerra a sessão atual e retorna à tela de login.
 *
 * Responsividade:
 * - Em telas menores (mobile/tablet), exibe apenas os ícones (w-16).
 * - Em telas médias em diante (desktop), exibe ícones e rótulos textuais (md:w-56).
 */

import { Church, Users, Wallet, LogOut, LayoutDashboard, type LucideIcon } from 'lucide-react';
import type { Role } from '../../types/types';

/** Tipos de telas navegáveis */
type Page = 'dashboard' | 'members' | 'finance';

/**
 * Propriedades recebidas pelo componente Sidebar.
 */
interface SidebarProps {
  /** Papel do usuário logado (usado para habilitar ou ocultar abas) */
  role: Role;
  /** Página atualmente ativa */
  page: Page;
  /** Callback para alternância de página */
  setPage: (page: Page) => void;
  /** Callback para deslogar do sistema */
  onLogout: () => void;
}

/**
 * Item de menu da barra lateral.
 */
interface NavItem {
  id: Page;
  label: string;
  icon: LucideIcon;
  show: boolean;
}

/**
 * Componente principal da barra lateral.
 */
export default function Sidebar({ role, page, setPage, onLogout }: SidebarProps) {
  // Lista de itens de navegação com controle de visibilidade baseado no papel
  const items: NavItem[] = [
    { id: 'dashboard', label: 'Painel', icon: LayoutDashboard, show: true },
    { id: 'members', label: 'Membros', icon: Users, show: role === 'admin' },
    { id: 'finance', label: 'Financeiro', icon: Wallet, show: true },
  ];

  return (
    <aside className="w-16 md:w-56 shrink-0 bg-[#1B2A4A] text-white flex flex-col min-h-screen select-none">
      {/* Logotipo / Sigla da congregação */}
      <div className="flex items-center gap-2 px-3 md:px-5 py-5 border-b border-white/10">
        <Church size={20} className="text-[#B8863B] shrink-0" />
        <span style={{ fontFamily: "'Fraunces', serif" }} className="hidden md:inline text-lg font-semibold tracking-wide">
          IECVK
        </span>
      </div>

      {/* Navegação com botões de alternância */}
      <nav className="flex-1 py-4 flex flex-col gap-1 px-2">
        {items
          .filter((item) => item.show)
          .map(({ id, label, icon: Icon }) => {
            const isActive = page === id;
            return (
              <button
                key={id}
                onClick={() => setPage(id)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#B8863B] ${
                  isActive
                    ? 'bg-[#B8863B] text-[#1B2A4A] font-semibold shadow-sm'
                    : 'text-white/80 hover:bg-white/10'
                }`}
                title={label}
              >
                <Icon size={18} className="shrink-0" />
                <span className="hidden md:inline">{label}</span>
              </button>
            );
          })}
      </nav>

      {/* Botão de encerramento da sessão */}
      <button
        onClick={onLogout}
        className="flex items-center gap-3 px-3 md:px-5 py-4 text-white/70 hover:text-white hover:bg-white/10 text-sm border-t border-white/10 focus:outline-none focus:ring-2 focus:ring-[#B8863B] transition-colors"
        title="Sair do sistema"
      >
        <LogOut size={18} className="shrink-0" />
        <span className="hidden md:inline">Sair</span>
      </button>
    </aside>
  );
}

