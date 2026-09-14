/**
 * ============================================================================
 * FORMULÁRIO DE LANÇAMENTO FINANCEIRO (FINANCE FORM)
 * ============================================================================
 * Modal para registro de movimentações financeiras do livro-caixa da igreja:
 * - Alternância entre Entrada (receita) e Saída (despesa).
 * - Seleção dinâmica de categorias conforme o tipo escolhido.
 * - Validação de valores monetários positivos.
 * - Data de competência e descrição histórica do lançamento.
 */

import React, { useState } from 'react';
import { X, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../../constants/constants';
import Field from '../shared/Field';
import type { FinanceEntry, FinanceType } from '../../types/types';

/**
 * Propriedades do componente FinanceForm.
 */
interface FinanceFormProps {
  /** Callback para fechar o formulário sem persistir */
  onCancel: () => void;
  /** Callback acionado com os dados do lançamento financeiro preenchido */
  onSave: (entry: Omit<FinanceEntry, 'id'>) => void;
}

/**
 * Modal para adição de novas entradas ou saídas financeiras.
 */
export default function FinanceForm({ onCancel, onSave }: FinanceFormProps) {
  // Tipo da movimentação: 'entrada' (receitas) ou 'saida' (despesas)
  const [type, setType] = useState<FinanceType>('entrada');
  // Categoria selecionada
  const [category, setCategory] = useState(INCOME_CATEGORIES[0]);
  // Valor numérico em string para o input
  const [amount, setAmount] = useState('');
  // Data da operação (padrão: hoje em formato YYYY-MM-DD)
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  // Descrição livre do lançamento
  const [description, setDescription] = useState('');

  // Seleciona a lista de categorias correspondente ao tipo selecionado
  const categories = type === 'entrada' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  /**
   * Valida e submete o lançamento financeiro.
   */
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = Number(amount);
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) return;

    onSave({
      type,
      category,
      amount: parsedAmount,
      date,
      description: description.trim(),
    });
  };

  /**
   * Altera o tipo de lançamento e reseta a categoria selecionada para o primeiro item válido.
   */
  const handleTypeChange = (newType: FinanceType) => {
    setType(newType);
    setCategory(newType === 'entrada' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0]);
  };

  return (
    <div className="fixed inset-0 bg-[#1B2A4A]/50 backdrop-blur-xs flex items-center justify-center p-4 z-30">
      <form
        onSubmit={submit}
        className="bg-[#F7F3EA] rounded-2xl shadow-2xl p-6 w-full max-w-md border border-[#1B2A4A]/10"
      >
        {/* Cabeçalho do Modal */}
        <div className="flex items-center justify-between mb-5 border-b border-[#1B2A4A]/10 pb-3">
          <h3 style={{ fontFamily: "'Fraunces', serif" }} className="text-xl font-semibold text-[#1B2A4A]">
            Novo Lançamento Financeiro
          </h3>
          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 rounded-lg text-[#6B6B63] hover:text-[#1B2A4A] hover:bg-[#1B2A4A]/10 focus:outline-none focus:ring-2 focus:ring-[#B8863B] transition-colors"
            title="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Seletor de Tipo (Entrada vs Saída) */}
        <div className="grid grid-cols-2 gap-2.5 mb-4">
          <button
            type="button"
            onClick={() => handleTypeChange('entrada')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold border transition-all ${
              type === 'entrada'
                ? 'bg-[#4B6656] text-white border-[#4B6656] shadow-sm'
                : 'border-[#1B2A4A]/15 text-[#6B6B63] bg-white/60 hover:bg-white'
            }`}
          >
            <ArrowUpCircle size={17} /> Entrada (Receita)
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('saida')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold border transition-all ${
              type === 'saida'
                ? 'bg-[#A6432D] text-white border-[#A6432D] shadow-sm'
                : 'border-[#1B2A4A]/15 text-[#6B6B63] bg-white/60 hover:bg-white'
            }`}
          >
            <ArrowDownCircle size={17} /> Saída (Despesa)
          </button>
        </div>

        {/* Campos de Inserção */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Field label="Categoria">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="input"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Valor (R$) *">
            <input
              required
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="input"
              placeholder="0,00"
            />
          </Field>

          <Field label="Data da operação *">
            <input
              required
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input"
            />
          </Field>

          <Field label="Descrição detalhada" full>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input"
              placeholder="Ex: Dízimos do culto ou conta de energia"
            />
          </Field>
        </div>

        {/* Rodapé com Ações */}
        <div className="flex justify-end gap-2.5 mt-6 pt-4 border-t border-[#1B2A4A]/10">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium rounded-lg text-[#6B6B63] hover:bg-[#1B2A4A]/5 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-5 py-2 text-sm font-semibold rounded-lg bg-[#1B2A4A] text-white hover:bg-[#34456B] shadow-sm transition-colors"
          >
            Salvar Lançamento
          </button>
        </div>
      </form>
    </div>
  );
}

