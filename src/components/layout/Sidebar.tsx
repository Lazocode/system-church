import { Church, Users, Wallet, LogOut, LayoutDashboard, type LucideIcon } from 'lucide-react';
import type { Role } from '../../types/types';

type Page = 'dashboard' | 'members' | 'finance';

interface SidebarProps {
  role: Role;
  page: Page;
  setPage: (page: Page) => void;
  onLogout: () => void;
}

interface NavItem {
  id: Page;
  label: string;
  icon: LucideIcon;
  show: boolean;
}

export default function Sidebar({ role, page, setPage, onLogout }: SidebarProps) {
  const items: NavItem[] = [
    { id: 'dashboard', label: 'Painel', icon: LayoutDashboard, show: true },
    { id: 'members', label: 'Membros', icon: Users, show: role === 'admin' },
    { id: 'finance', label: 'Financeiro', icon: Wallet, show: true },
  ];

  return (
    <aside className="w-16 md:w-56 shrink-0 bg-[#1B2A4A] text-white flex flex-col min-h-screen">
      <div className="flex items-center gap-2 px-3 md:px-5 py-5 border-b border-white/10">
        <Church size={20} className="text-[#B8863B] shrink-0" />
        <span style={{ fontFamily: "'Fraunces', serif" }} className="hidden md:inline text-lg font-semibold">
          IECVK
        </span>
      </div>

      <nav className="flex-1 py-4 flex flex-col gap-1 px-2">
        {items.filter((i) => i.show).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setPage(id)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#B8863B] ${
              page === id ? 'bg-[#B8863B] text-[#1B2A4A] font-medium' : 'text-white/80 hover:bg-white/10'
            }`}
          >
            <Icon size={18} className="shrink-0" />
            <span className="hidden md:inline">{label}</span>
          </button>
        ))}
      </nav>

      <button
        onClick={onLogout}
        className="flex items-center gap-3 px-3 md:px-5 py-4 text-white/70 hover:text-white hover:bg-white/10 text-sm border-t border-white/10 focus:outline-none focus:ring-2 focus:ring-[#B8863B]"
      >
        <LogOut size={18} />
        <span className="hidden md:inline">Sair</span>
      </button>
    </aside>
  );
}
