
/**
 * ============================================================================
 * COMPONENTE DE ESTADO VAZIO (EMPTY STATE)
 * ============================================================================
 * Exibe uma área com borda tracejada e mensagem orientativa quando não
 * existem itens cadastrados ou quando uma filtragem não retorna resultados.
 */

/**
 * Propriedades do componente EmptyState.
 */
interface EmptyStateProps {
  /** Mensagem informativa exibida centralizada */
  text: string;
}

/**
 * Renderiza um container pontilhado elegante para estados sem registros.
 */
export default function EmptyState({ text }: EmptyStateProps) {
  return (
    <div className="border border-dashed border-[#1B2A4A]/20 rounded-xl py-16 text-center text-[#6B6B63] text-sm bg-white/40">
      {text}
    </div>
  );
}

