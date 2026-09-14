/**
 * ============================================================================
 * COMPONENTE DE CAMPO DE FORMULÁRIO (FIELD)
 * ============================================================================
 * Envolve elementos de entrada (input, select, textarea) com um rótulo padronizado
 * e suporte a layouts em grid responsivos (ocupando 1 coluna ou 2 colunas).
 */

import React from 'react';

/**
 * Propriedades do componente Field.
 */
interface FieldProps {
  /** Rótulo exibido acima do controle de entrada */
  label: string;
  /** Elemento interativo (input, select, textarea) */
  children: React.ReactNode;
  /** Se verdadeiro, ocupa a largura total no layout em grid de duas colunas */
  full?: boolean;
}

/**
 * Componente funcional para renderização uniforme de campos com labels.
 */
export default function Field({ label, children, full }: FieldProps) {
  return (
    <label className={`block ${full ? 'sm:col-span-2' : ''}`}>
      <span className="block text-xs font-medium text-[#6B6B63] mb-1">{label}</span>
      {children}
    </label>
  );
}

