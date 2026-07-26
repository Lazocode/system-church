import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string;
  color: string;
  Icon: LucideIcon;
}

export default function StatCard({ label, value, color, Icon }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl p-5 border border-[#1B2A4A]/10 flex items-center gap-4">
      <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: color + '1a' }}>
        <Icon size={22} style={{ color }} />
      </div>
      <div>
        <p className="text-xs text-[#6B6B63] uppercase tracking-wide">{label}</p>
        <p style={{ fontFamily: "'IBM Plex Mono', monospace" }} className="text-lg font-medium text-[#1B2A4A]">
          {value}
        </p>
      </div>
    </div>
  );
}
