
interface EmptyStateProps {
  text: string;
}

export default function EmptyState({ text }: EmptyStateProps) {
  return (
    <div className="border border-dashed border-[#1B2A4A]/20 rounded-xl py-16 text-center text-[#6B6B63] text-sm">
      {text}
    </div>
  );
}
