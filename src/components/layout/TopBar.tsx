/**
 * ============================================================================
 * BARRA SUPERIOR (TOPBAR)
 * ============================================================================
 * Exibe a saudação institucional ao usuário autenticado e a identificação
 * visual do papel ativo (Administração ou Tesouraria) em formato de badge.
 */

import type { Role } from '../../types/types';

/**
 * Propriedades recebidas pelo TopBar.
 */
interface TopBarProps {
  /** Papel do usuário atualmente logado */
  role: Role;
}

/**
 * Cabeçalho fixo no topo da área principal de conteúdo.
 */
export default function TopBar({ role }: TopBarProps) {
  return (
    <header className="border-b border-[#1B2A4A]/10 bg-[#F7F3EA]/80 backdrop-blur px-5 md:px-8 py-4 flex items-center justify-between sticky top-0 z-10">
      {/* Saudação com tipografia serifada clássica */}
      <span style={{ fontFamily: "'Fraunces', serif" }} className="text-lg text-[#1B2A4A] font-semibold">
        Bem-vindo
      </span>

      {/* Badge indicativo do papel atual do usuário */}
      <span className="text-xs uppercase tracking-wider font-semibold px-3 py-1 rounded-full bg-[#4B6656]/15 text-[#3a5244] border border-[#4B6656]/20">
        {role === 'admin' ? 'Administração Geral' : 'Tesouraria'}
      </span>
    </header>
  );
}

