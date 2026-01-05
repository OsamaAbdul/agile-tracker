import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { FileText, Inbox, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: 'document' | 'inbox' | 'users';
  action?: ReactNode;
  className?: string;
}

const icons = {
  document: FileText,
  inbox: Inbox,
  users: Users,
};

export function EmptyState({ title, description, icon = 'inbox', action, className }: EmptyStateProps) {
  const Icon = icons[icon];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'flex flex-col items-center justify-center py-12 px-6 text-center',
        className
      )}
    >
      <div className="p-4 bg-muted rounded-full mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium text-foreground mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-sm mb-4">{description}</p>
      )}
      {action}
    </motion.div>
  );
}
