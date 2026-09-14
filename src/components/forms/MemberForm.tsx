import React, { useState } from 'react';
import { X } from 'lucide-react';
import { MINISTRIES } from '../../constants/constants';
import Field from '../shared/Field';
import type { Member } from '../../../src/types/types';

type MemberFormData = Omit<Member, 'id'>;

interface MemberFormProps {
  initial: Member | null;
  onCancel: () => void;
  onSave: (data: MemberFormData) => void;
}

const emptyForm: MemberFormData = {
  name: '', phone: '', email: '', address: '', birthdate: '', ministry: '', joinedDate: '', notes: '',
};

export default function MemberForm({ initial, onCancel, onSave }: MemberFormProps) {
  const [form, setForm] = useState<MemberFormData>(initial ?? emptyForm);
  const update = (k: keyof MemberFormData, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-[#1B2A4A]/40 flex items-center justify-center p-4 z-20">
      <form onSubmit={submit} className="bg-[#F7F3EA] rounded-2xl shadow-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 style={{ fontFamily: "'Fraunces', serif" }} className="text-xl text-[#1B2A4A]">
            {initial ? 'Editar membro' : 'Novo membro'}
          </h3>
          <button type="button" onClick={onCancel} className="p-1 rounded hover:bg-[#1B2A4A]/10 focus:outline-none focus:ring-2 focus:ring-[#B8863B]">
            <X size={18} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Nome completo *" full>
            <input required value={form.name} onChange={(e) => update('name', e.target.value)} className="input" />
          </Field>
          <Field label="Telefone">
            <input value={form.phone} onChange={(e) => update('phone', e.target.value)} className="input" />
          </Field>
          <Field label="E-mail">
            <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} className="input" />
          </Field>
          <Field label="Endereço" full>
            <input value={form.address} onChange={(e) => update('address', e.target.value)} className="input" />
          </Field>
          <Field label="Data de nascimento">
            <input type="date" value={form.birthdate} onChange={(e) => update('birthdate', e.target.value)} className="input" />
          </Field>
          <Field label="Membro desde">
            <input type="date" value={form.joinedDate} onChange={(e) => update('joinedDate', e.target.value)} className="input" />
          </Field>
          <Field label="Ministério">
            <select value={form.ministry} onChange={(e) => update('ministry', e.target.value)} className="input">
              <option value="">Selecione…</option>
              {MINISTRIES.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </Field>
          <Field label="Observações" full>
            <textarea value={form.notes} onChange={(e) => update('notes', e.target.value)} className="input" rows={2} />
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
