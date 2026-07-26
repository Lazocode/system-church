import { useMemo, useState } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { ArrowUpCircle, ArrowDownCircle, Wallet } from 'lucide-react';
import { PALETTE } from '../constants';
import { fmtBRL, monthLabel } from '../utils';
import StatCard from './shared/StatCard';
import EmptyState from './shared/EmptyState';
import type { FinanceEntry } from '../types';

interface DashboardProps {
  finance: FinanceEntry[];
}

interface MonthlyDatum {
  ym: string;
  entradas: number;
  saidas: number;
  label: string;
}

interface CategoryDatum {
  name: string;
  value: number;
}

export default function Dashboard({ finance }: DashboardProps) {
  const [period, setPeriod] = useState<string>('all');

  const months = useMemo(() => {
    const set = new Set(finance.map((f) => f.date.slice(0, 7)));
    return Array.from(set).sort();
  }, [finance]);

  const filtered = period === 'all' ? finance : finance.filter((f) => f.date.slice(0, 7) === period);

  const totals = filtered.reduce(
    (acc, f) => {
      if (f.type === 'entrada') acc.entradas += Number(f.amount);
      else acc.saidas += Number(f.amount);
      return acc;
    },
    { entradas: 0, saidas: 0 }
  );

  const monthlyData: MonthlyDatum[] = useMemo(() => {
    const map: Record<string, { ym: string; entradas: number; saidas: number }> = {};
    finance.forEach((f) => {
      const ym = f.date.slice(0, 7);
      if (!map[ym]) map[ym] = { ym, entradas: 0, saidas: 0 };
      map[ym][f.type === 'entrada' ? 'entradas' : 'saidas'] += Number(f.amount);
    });
    return Object.values(map)
      .sort((a, b) => a.ym.localeCompare(b.ym))
      .slice(-12)
      .map((d) => ({ ...d, label: monthLabel(d.ym) }));
  }, [finance]);

  const expenseByCategory: CategoryDatum[] = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.filter((f) => f.type === 'saida').forEach((f) => {
      map[f.category] = (map[f.category] || 0) + Number(f.amount);
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [filtered]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h2 style={{ fontFamily: "'Fraunces', serif" }} className="text-2xl text-[#1B2A4A]">
          Painel financeiro
        </h2>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="text-sm border border-[#1B2A4A]/15 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#B8863B]"
        >
          <option value="all">Todos os períodos</option>
          {months.map((m) => (
            <option key={m} value={m}>{monthLabel(m)}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Entradas" value={fmtBRL(totals.entradas)} color="#4B6656" Icon={ArrowUpCircle} />
        <StatCard label="Saídas" value={fmtBRL(totals.saidas)} color="#A6432D" Icon={ArrowDownCircle} />
        <StatCard label="Saldo" value={fmtBRL(totals.entradas - totals.saidas)} color="#1B2A4A" Icon={Wallet} />
      </div>

      {finance.length === 0 ? (
        <EmptyState text="Nenhum lançamento ainda. Adicione o primeiro na aba Financeiro." />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-5 border border-[#1B2A4A]/10">
            <h3 className="text-sm font-semibold text-[#1B2A4A] mb-4">Entradas x Saídas (últimos meses)</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1B2A4A11" />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#6B6B63' }} />
                <YAxis tick={{ fontSize: 12, fill: '#6B6B63' }} width={70} tickFormatter={(v) => fmtBRL(Number(v))} />
                <Tooltip formatter={(v: number) => fmtBRL(v)} />
                <Legend />
                <Bar dataKey="entradas" name="Entradas" fill="#4B6656" radius={[4, 4, 0, 0]} />
                <Bar dataKey="saidas" name="Saídas" fill="#A6432D" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl p-5 border border-[#1B2A4A]/10">
            <h3 className="text-sm font-semibold text-[#1B2A4A] mb-4">Saídas por categoria</h3>
            {expenseByCategory.length === 0 ? (
              <div className="h-[260px] flex items-center justify-center text-sm text-[#6B6B63]">
                Sem saídas no período.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={expenseByCategory} dataKey="value" nameKey="name" outerRadius={90} label={(d) => d.name}>
                    {expenseByCategory.map((_, i) => (
                      <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => fmtBRL(v)} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
