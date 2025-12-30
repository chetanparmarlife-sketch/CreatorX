interface StatusBadgeProps {
  status: 'active' | 'closed';
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const styles = {
    active: 'bg-green-100 text-green-700',
    closed: 'bg-gray-100 text-gray-700',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs ${styles[status]}`}>
      {status.toUpperCase()}
    </span>
  );
}

interface PillBadgeProps {
  label: string;
  variant?: 'outline' | 'solid';
}

export function PillBadge({ label, variant = 'outline' }: PillBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs ${
        variant === 'outline'
          ? 'border border-gray-300 text-gray-700 bg-white'
          : 'bg-gray-100 text-gray-700'
      }`}
    >
      {label}
    </span>
  );
}
