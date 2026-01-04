import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
}

export function PageHeader({ title, description, children, className }: PageHeaderProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn('flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 md:mb-8', className)}
    >
      <div className="space-y-1">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground tracking-tight">{title}</h1>
        {description && (
          <p className="text-sm md:text-base text-muted-foreground">{description}</p>
        )}
      </div>
      {children && <div className="flex items-center gap-2 md:gap-3">{children}</div>}
    </motion.div>
  );
}
