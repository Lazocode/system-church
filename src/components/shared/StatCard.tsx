/**
 * ============================================================================
 * COMPONENTE DE CARD DE ESTATÍSTICA (STAT CARD)
 * ============================================================================
 * Exibe um indicador chave de desempenho (KPI) no painel, contendo:
 * - Ícone temático com fundo translúcido na cor do indicador.
 * - Rótulo descritivo em caixa alta.
 * - Valor em destaque com tipografia monoespaçada ('IBM Plex Mono').
 * - Badge contextual (ex: contagem de lançamentos, % de retenção).
 * - Subtítulo explicativo em linguagem clara para quem não é contador.
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
  /** Badge contextual opcional (ex: "+12 lançamentos", "Superávit") */
  badge?: {
    text: string;
    type?: 'positive' | 'negative' | 'neutral' | 'accent';
  };
  /** Descrição explicativa em linguagem acessível */
  description?: string;
  /** Destaque visual sutil (borda ou fundo enriquecido) */
  highlight?: boolean;
}

/**
 * Card visual de métricas do painel financeiro, moderno e autoexplicativo.
 */
export default function StatCard({
  label,
  value,
  color,
  Icon,
  badge,
  description,
  highlight = false,
}: StatCardProps) {
  const badgeClasses = {
    positive: 'bg-[#4B6656]/10 text-[#3d5747] border-[#4B6656]/20',
    negative: 'bg-[#A6432D]/10 text-[#8e3621] border-[#A6432D]/20',
    neutral: 'bg-[#1B2A4A]/5 text-[#1B2A4A] border-[#1B2A4A]/15',
    accent: 'bg-[#B8863B]/15 text-[#8f621f] border-[#B8863B]/30',
  }[badge?.type || 'neutral'];

  return (
    <div
      className={`relative bg-white rounded-2xl p-5 sm:p-6 border transition-all duration-200 hover:shadow-md flex flex-col justify-between ${
        highlight
          ? 'border-[#1B2A4A]/25 ring-1 ring-[#1B2A4A]/10 shadow-sm bg-gradient-to-br from-white via-white to-[#FAF7F2]'
          : 'border-[#1B2A4A]/10 shadow-xs'
      }`}
    >
      {/* Topo do Card: Ícone + Rótulo + Badge */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-2xs"
            style={{ backgroundColor: color + '18' }}
          >
            <Icon size={22} style={{ color }} />
          </div>
          <div>
            <p className="text-xs text-[#6B6B63] uppercase tracking-wider font-semibold">
              {label}
            </p>
          </div>
        </div>

        {badge && (
          <span
            className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border shrink-0 tracking-wide ${badgeClasses}`}
          >
            {badge.text}
          </span>
        )}
      </div>

      {/* Valor em destaque */}
      <div className="mt-1 mb-2">
        <p
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1B2A4A]"
        >
          {value}
        </p>
      </div>

      {/* Descrição explicativa para facilitar a leitura */}
      {description && (
        <div className="pt-2.5 border-t border-[#1B2A4A]/5 text-xs text-[#6B6B63] leading-relaxed">
          {description}
        </div>
      )}
    </div>
  );
}


