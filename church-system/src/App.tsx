import { useState, useEffect, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { getData, setData } from './storage';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import Dashboard from './components/Dashboard';
import Members from './components/Members';
import Finance from './components/Finance';
import type { Member, FinanceEntry, Role } from './types';

type Page = 'dashboard' | 'members' | 'finance';

export default function App() {
  const [role, setRole] = useState<Role | null>(null);
  const [page, setPage] = useState<Page>('dashboard');

  const [members, setMembers] = useState<Member[]>([]);
  const [finance, setFinance] = useState<FinanceEntry[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState('');

  const loadAll = useCallback(async () => {
    setDataLoading(true);
    setDataError('');
    try {
      const [m, f] = await Promise.all([
        getData<Member>('church-members'),
        getData<FinanceEntry>('church-finance'),
      ]);
      setMembers(m);
      setFinance(f);
    } catch (e) {
      setDataError('Não foi possível carregar os dados. Tente novamente.');
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    if (role) loadAll();
  }, [role, loadAll]);

  const persistMembers = async (next: Member[]) => {
    setMembers(next);
    const ok = await setData('church-members', next);
    if (!ok) setDataError('Falha ao salvar os membros.');
  };

  const persistFinance = async (next: FinanceEntry[]) => {
    setFinance(next);
    const ok = await setData('church-finance', next);
    if (!ok) setDataError('Falha ao salvar os lançamentos.');
  };

  if (!role) return <Login onLogin={setRole} />;

  return (
    <div className="min-h-screen w-full flex bg-[#F7F3EA] text-[#1B2A4A]">
      <Sidebar role={role} page={page} setPage={setPage} onLogout={() => setRole(null)} />
      <main className="flex-1 min-h-screen overflow-y-auto">
        <TopBar role={role} />
        <div className="p-5 md:p-8 max-w-6xl mx-auto">
          {dataError && (
            <div className="mb-5 rounded-lg border border-[#A6432D]/30 bg-[#A6432D]/10 text-[#A6432D] px-4 py-3 text-sm">
              {dataError}
            </div>
          )}
          {dataLoading ? (
            <div className="flex items-center gap-2 text-[#6B6B63] py-20 justify-center">
              <Loader2 className="animate-spin" size={20} /> Carregando dados…
            </div>
          ) : (
            <>
              {page === 'dashboard' && <Dashboard finance={finance} />}
              {page === 'members' && role === 'admin' && <Members members={members} setMembers={persistMembers} />}
              {page === 'finance' && <Finance finance={finance} setFinance={persistFinance} />}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
