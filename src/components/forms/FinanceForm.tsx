import React, { useState } from 'react';
import { X, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../../constants/constants';
import Field from '../shared/Field';
import type { FinanceEntry, FinanceType } from '../../../src/types/types';

interface FinanceFormProps {
  onCancel: () => void;
  onSave: (entry: Omit<FinanceEntry, 'id'>) => void;
}

export default function FinanceForm({ onCancel, onSave }: FinanceFormProps) {
  const [type, setType] = useState<FinanceType>('entrada');
  const [category, setCategory] = useState(INCOME_CATEGORIES[0]);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState('');

  const categories = type === 'entrada' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;
    onSave({ type, category, amount: Number(amount), date, description });
  };

  return (
    <div className="fixed inset-0 bg-[#1B2A4A]/40 flex items-center justify-center p-4 z-20">
      <form onSubmit={submit} className="bg-[#F7F3EA] rounded-2xl shadow-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-5">
          <h3 style={{ fontFamily: "'Fraunces', serif" }} className="text-xl text-[#1B2A4A]">Novo lançamento</h3>
          <button type="button" onClick={onCancel} className="p-1 rounded hover:bg-[#1B2A4A]/10 focus:outline-none focus:ring-2 focus:ring-[#B8863B]">
            <X size={18} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          <button
            type="button"
            onClick={() => { setType('entrada'); setCategory(INCOME_CATEGORIES[0]); }}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium border ${
              type === 'entrada' ? 'bg-[#4B6656] text-white border-[#4B6656]' : 'border-[#1B2A4A]/15 text-[#6B6B63]'
            }`}
          >
            <ArrowUpCircle size={16} /> Entrada
          </button>
          <button
            type="button"
            onClick={() => { setType('saida'); setCategory(EXPENSE_CATEGORIES[0]); }}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium border ${
              type === 'saida' ? 'bg-[#A6432D] text-white border-[#A6432D]' : 'border-[#1B2A4A]/15 text-[#6B6B63]'
            }`}
          >
            <ArrowDownCircle size={16} /> Saída
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Categoria">
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="input">
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Valor (R$) *">
            <input required type="number" min="0.01" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className="input" />
          </Field>
          <Field label="Data *">
            <input required type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input" />
          </Field>
          <Field label="Descrição" full>
            <input value={description} onChange={(e) => setDescription(e.target.value)} className="input" />
          </Field>
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <button type="button" onClick={onCancel} className="px-4 py-2 text-sm rounded-lg text-[#6B6B63] hover:bg-[#1B2A4A]/5">
            Cancelar
          </button>
          <button type="submit" className="px-4 py-2 text-sm rounded-lg bg-[#1B2A4A] text-white font-medium hover:bg-[#34456B]">
            Salvar
          </button>
        </div>
      </form>
    </div>
  );
}
