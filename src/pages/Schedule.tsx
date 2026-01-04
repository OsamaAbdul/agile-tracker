import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { useComponents } from '@/hooks/useComponents';
import { useSubmissions } from '@/hooks/useSubmissions';
import { MONTHS, getSubmissionStatus, getSubmissionDeadline } from '@/types';

export default function Schedule() {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const { data: components, isLoading: isLoadingComponents } = useComponents();
  const { data: submissions, isLoading: isLoadingSubmissions } = useSubmissions({ year: currentYear });

  // Create a matrix of components x months
  const getSubmissionForMonth = (componentId: string, month: number) => {
    return submissions?.find(
      s => s.component_id === componentId && s.month === month && s.year === currentYear
    );
  };

  if (isLoadingComponents || isLoadingSubmissions) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader 
        title="Submission Schedule" 
        description={`${currentYear} submission calendar overview`}
      />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-lg shadow-sm overflow-x-auto"
      >
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left p-4 data-table-header sticky left-0 bg-card z-10 min-w-48">
                Component
              </th>
              {MONTHS.map((month, index) => {
                const isCurrent = index + 1 === currentMonth;
                
                return (
                  <th 
                    key={month} 
                    className={`p-2 text-center data-table-header ${isCurrent ? 'bg-accent' : ''}`}
                  >
                    <span className="text-xs">{month.substring(0, 3)}</span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {components?.map((component) => (
              <tr key={component.id} className="border-b border-border last:border-0">
                <td className="p-4 sticky left-0 bg-card z-10">
                  <span className="font-medium text-sm">{component.name}</span>
                </td>
                {MONTHS.map((_, monthIndex) => {
                  const month = monthIndex + 1;
                  const submission = getSubmissionForMonth(component.id, month);
                  const status = getSubmissionStatus(submission as any, month, currentYear);
                  const deadline = getSubmissionDeadline(month, currentYear);
                  const isPast = new Date() > deadline;
                  const isCurrent = month === currentMonth;
                  
                  // Don't show status for future months
                  if (!isPast && !isCurrent) {
                    return (
                      <td 
                        key={month} 
                        className="p-2 text-center"
                      >
                        <span className="text-xs text-muted-foreground">—</span>
                      </td>
                    );
                  }
                  
                  return (
                    <td 
                      key={month} 
                      className={`p-2 text-center ${isCurrent ? 'bg-accent/50' : ''}`}
                    >
                      <StatusBadge status={status} showIcon={false} className="text-xs px-2 py-0.5" />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <StatusBadge status="submitted" showIcon={false} />
          <span className="text-muted-foreground">On-time</span>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status="late" showIcon={false} />
          <span className="text-muted-foreground">Late</span>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status="pending" showIcon={false} />
          <span className="text-muted-foreground">Pending</span>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status="missing" showIcon={false} />
          <span className="text-muted-foreground">Missing</span>
        </div>
      </div>
    </DashboardLayout>
  );
}
