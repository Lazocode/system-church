/**
 * ============================================================================
 * FORMULÁRIO DE CADASTRO E EDIÇÃO DE MEMBROS (MEMBER FORM)
 * ============================================================================
 * Modal suspenso para inclusão de novos membros ou atualização cadastral
 * de membros existentes (nome, contatos, ministério, data de ingresso e notas).
 */

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { MINISTRIES } from '../../constants/constants';
import Field from '../shared/Field';
import type { Member } from '../../types/types';

/**
 * Tipo dos dados gerenciados pelo formulário (exclui o ID gerado pelo sistema).
 */
export type MemberFormData = Omit<Member, 'id'>;

/**
 * Propriedades do componente MemberForm.
 */
interface MemberFormProps {
  /** Dados do membro para edição, ou null para cadastro de novo membro */
  initial: Member | null;
  /** Callback para fechar o formulário sem salvar */
  onCancel: () => void;
  /** Callback acionado ao submeter os dados validados */
  onSave: (data: MemberFormData) => void;
}

/**
 * Estado inicial limpo para cadastro de novo membro.
 */
const emptyForm: MemberFormData = {
  name: '',
  phone: '',
  email: '',
  address: '',
  birthdate: '',
  ministry: '',
  joinedDate: '',
  notes: '',
};

/**
 * Modal de formulário para criação e edição de membros.
 */
export default function MemberForm({ initial, onCancel, onSave }: MemberFormProps) {
  // Inicializa o estado com os dados existentes ou formulário em branco
  const [form, setForm] = useState<MemberFormData>(initial ?? emptyForm);

  /**
   * Atualiza um campo individual do formulário.
   */
  const update = (key: keyof MemberFormData, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  /**
   * Valida e submete o formulário.
   */
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-[#1B2A4A]/50 backdrop-blur-xs flex items-center justify-center p-4 z-30">
      <form
        onSubmit={submit}
        className="bg-[#F7F3EA] rounded-2xl shadow-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto border border-[#1B2A4A]/10"
      >
        {/* Cabeçalho do Modal */}
        <div className="flex items-center justify-between mb-5 border-b border-[#1B2A4A]/10 pb-3">
          <h3 style={{ fontFamily: "'Fraunces', serif" }} className="text-xl font-semibold text-[#1B2A4A]">
            {initial ? 'Editar Membro' : 'Novo Membro'}
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

        {/* Campos de Cadastro em Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Field label="Nome completo *" full>
            <input
              required
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              className="input"
              placeholder="Ex: João da Silva"
            />
          </Field>

          <Field label="Telefone / WhatsApp">
            <input
              value={form.phone}
              onChange={(e) => update('phone', e.target.value)}
              className="input"
              placeholder="(11) 99999-9999"
            />
          </Field>

          <Field label="E-mail">
            <input
              type="email"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              className="input"
              placeholder="joao@exemplo.com"
            />
          </Field>

          <Field label="Endereço residencial" full>
            <input
              value={form.address}
              onChange={(e) => update('address', e.target.value)}
              className="input"
              placeholder="Rua, número, bairro, cidade"
            />
          </Field>

          <Field label="Data de nascimento">
            <input
              type="date"
              value={form.birthdate}
              onChange={(e) => update('birthdate', e.target.value)}
              className="input"
            />
          </Field>

          <Field label="Membro desde">
            <input
              type="date"
              value={form.joinedDate}
              onChange={(e) => update('joinedDate', e.target.value)}
              className="input"
            />
          </Field>

          <Field label="Ministério / Departamento">
            <select
              value={form.ministry}
              onChange={(e) => update('ministry', e.target.value)}
              className="input"
            >
              <option value="">Selecione um ministério…</option>
              {MINISTRIES.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Observações e anotações pastorais" full>
            <textarea
              value={form.notes}
              onChange={(e) => update('notes', e.target.value)}
              className="input resize-none"
              rows={2}
              placeholder="Informações adicionais..."
            />
          </Field>
        </div>

        {/* Rodapé com botões de ação */}
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
            Salvar Membro
          </button>
        </div>
      </form>
    </div>
  );
}

