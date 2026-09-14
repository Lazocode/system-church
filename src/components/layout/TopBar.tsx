import type { Role } from '../../types/types';

interface TopBarProps {
  role: Role;
}

export default function TopBar({ role }: TopBarProps) {
  return (
    <div className="border-b border-[#1B2A4A]/10 bg-[#F7F3EA]/80 backdrop-blur px-5 md:px-8 py-4 flex items-center justify-between sticky top-0 z-10">
      <span style={{ fontFamily: "'Fraunces', serif" }} className="text-lg text-[#1B2A4A]">
        Bem-vindo
      </span>
      <span className="text-xs uppercase tracking-wide font-medium px-2.5 py-1 rounded-full bg-[#4B6656]/10 text-[#4B6656]">
        {role === 'admin' ? 'Administração' : 'Tesouraria'}
      </span>
    </div>
  );
}
