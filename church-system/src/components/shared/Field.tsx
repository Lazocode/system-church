import React from 'react';

interface FieldProps {
  label: string;
  children: React.ReactNode;
  full?: boolean;
}

export default function Field({ label, children, full }: FieldProps) {
  return (
    <label className={`block ${full ? 'sm:col-span-2' : ''}`}>
      <span className="block text-xs font-medium text-[#6B6B63] mb-1">{label}</span>
      {children}
    </label>
  );
}
