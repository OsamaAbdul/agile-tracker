import { SubmissionStatus } from '@/types';
import { cn } from '@/lib/utils';
import { CheckCircle2, Clock, AlertTriangle, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: SubmissionStatus;
  showIcon?: boolean;
  className?: string;
}

const statusConfig: Record<SubmissionStatus, { label: string; className: string; Icon: typeof CheckCircle2 }> = {
  submitted: {
    label: 'Submitted',
    className: 'bg-primary/10 text-primary border-primary/20',
    Icon: CheckCircle2,
  },
  pending: {
    label: 'Pending',
    className: 'bg-warning/10 text-warning border-warning/20',
    Icon: Clock,
  },
  late: {
    label: 'Late',
    className: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
    Icon: AlertTriangle,
  },
  missing: {
    label: 'Missing',
    className: 'bg-destructive/10 text-destructive border-destructive/20',
    Icon: XCircle,
  },
};

export function StatusBadge({ status, showIcon = true, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  const { Icon } = config;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
        config.className,
        className
      )}
    >
      {showIcon && <Icon className="h-3 w-3" />}
      {config.label}
    </span>
  );
}
