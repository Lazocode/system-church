/**
 * ============================================================================
 * COMPONENTE DE CARD DE ESTATÍSTICA (STAT CARD)
 * ============================================================================
 * Exibe um indicador chave de desempenho (KPI) no painel, contendo:
 * - Ícone temático com fundo translúcido na cor do indicador.
 * - Rótulo descritivo em caixa alta.
 * - Valor em destaque com tipografia monoespaçada ('IBM Plex Mono').
 */

import type { LucideIcon } from 'lucide-react';

/**
 * Propriedades do componente StatCard.
 */
interface StatCardProps {
  /** Rótulo textual superior do indicador (ex: "Entradas", "Saldo Líquido") */
  label: string;
  /** Valor formatado para exibição (ex: "R$ 4.250,00") */
  value: string;
  /** Cor hexadecimal utilizada no ícone e fundo translúcido */
  color: string;
  /** Componente de ícone da biblioteca lucide-react */
  Icon: LucideIcon;
}

/**
 * Card visual de métricas do painel financeiro.
 */
export default function StatCard({ label, value, color, Icon }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl p-5 border border-[#1B2A4A]/10 flex items-center gap-4 shadow-sm">
      {/* Círculo do ícone com tonalidade translúcida (10% de opacidade via '1a') */}
      <div
        className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
        style={{ backgroundColor: color + '1a' }}
      >
        <Icon size={22} style={{ color }} />
      </div>

      {/* Conteúdo textual e valor da métrica */}
      <div>
        <p className="text-xs text-[#6B6B63] uppercase tracking-wide font-medium">{label}</p>
        <p
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          className="text-lg font-semibold text-[#1B2A4A] tracking-tight"
        >
          {value}
        </p>
      </div>
    </div>
  );
}

