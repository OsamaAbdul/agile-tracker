import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
  Building2,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  Loader2,
  ArrowRight
} from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { PageHeader } from '@/components/PageHeader';
import { StatCard } from '@/components/StatCard';
import { StatusBadge } from '@/components/StatusBadge';
import { SubmissionReviewCard } from '@/components/SubmissionReviewCard';
import { useAuth } from '@/contexts/AuthContext';
import { useComponents } from '@/hooks/useComponents';
import { useSubmissions, useComponentSubmissions } from '@/hooks/useSubmissions';
import { MONTHS, getSubmissionStatus, isSubmissionWindowOpen } from '@/types';
import { Button } from '@/components/ui/button';
import { useSettings } from '@/hooks/useSettings';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const currentMonth = new Date().getMonth() + 1;
const currentYear = new Date().getFullYear();

function AdminDashboard() {
  const { data: components, isLoading: isLoadingComponents } = useComponents();
  const { data: submissions, isLoading: isLoadingSubmissions } = useSubmissions({
    year: currentYear
  });

  const navigate = useNavigate();

  if (isLoadingComponents || isLoadingSubmissions) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  const currentMonthSubmissions = submissions?.filter(s => s.month === currentMonth) || [];
  const submitted = currentMonthSubmissions.filter(s => !s.is_late).length;
  const late = currentMonthSubmissions.filter(s => s.is_late).length;
  const missing = (components?.length || 0) - currentMonthSubmissions.length;

  const recentSubmissions = submissions
    ?.sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime())
    .slice(0, 5) || [];

  return (
    <DashboardLayout>
      <PageHeader
        title="Dashboard"
        description={`Activity overview for ${MONTHS[currentMonth - 1]} ${currentYear}`}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
        <StatCard
          title="Total Components"
          value={components?.length || 0}
          subtitle="Active units"
          icon={Building2}
        />
        <StatCard
          title="On Time"
          value={submitted}
          subtitle={`of ${components?.length || 0}`}
          icon={CheckCircle2}
        />
        <StatCard
          title="Late"
          value={late}
          subtitle="Needs review"
          icon={Clock}
        />
        <StatCard
          title="Missing"
          value={missing > 0 ? missing : 0}
          subtitle="Action required"
          icon={AlertTriangle}
        />
      </div>

      {/* Recent Submissions */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="premium-card overflow-hidden"
      >
        <div className="p-4 md:p-5 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Recent Submissions</h2>
            <p className="text-sm text-muted-foreground">Latest activity reports</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/submissions')} className="w-full sm:w-auto">
            View All
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        {recentSubmissions.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="data-table-header">Component</TableHead>
                  <TableHead className="data-table-header hidden sm:table-cell">Period</TableHead>
                  <TableHead className="data-table-header">Status</TableHead>
                  <TableHead className="data-table-header hidden md:table-cell">Score</TableHead>
                  <TableHead className="data-table-header hidden lg:table-cell">Submitted</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentSubmissions.map((submission) => {
                  const component = components?.find(c => c.id === submission.component_id);
                  const status = getSubmissionStatus(submission as any, submission.month, submission.year);

                  return (
                    <TableRow key={submission.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <span className="text-xs font-semibold text-primary">
                              {component?.name.charAt(0) || '?'}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-foreground truncate">{component?.name || 'Unknown'}</p>
                            <p className="text-xs text-muted-foreground sm:hidden">
                              {MONTHS[submission.month - 1]} {submission.year}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground">
                        {MONTHS[submission.month - 1]} {submission.year}
                      </TableCell>
                      <TableCell><StatusBadge status={status} /></TableCell>
                      <TableCell className="hidden md:table-cell">
                        {submission.score !== null ? (
                          <span className="font-semibold">{submission.score}/100</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground">
                        {new Date(submission.submitted_at).toLocaleDateString('en-NG', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="p-8 md:p-12 text-center">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-muted mb-4">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">No submissions yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Submissions will appear here once components start uploading reports.
            </p>
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
}

function AdminSubmissionControl() {
  const { isSubmissionsOpenOverride, updateSetting, isLoading } = useSettings();

  return (
    <Card className="mb-8 border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Global Submission Control
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <Label htmlFor="submission-toggle" className="text-base">Open Submissions Manually</Label>
            <p className="text-sm text-muted-foreground">
              When enabled, members can submit reports regardless of the monthly window (25th - 1st).
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={cn(
              "text-sm font-medium",
              isSubmissionsOpenOverride ? "text-primary" : "text-muted-foreground"
            )}>
              {isSubmissionsOpenOverride ? 'Open' : 'Closed'}
            </span>
            <Switch
              id="submission-toggle"
              checked={isSubmissionsOpenOverride}
              onCheckedChange={(checked) => updateSetting.mutate({ key: 'submissions_open', value: String(checked) })}
              disabled={isLoading || updateSetting.isPending}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MemberDashboard() {
  const { profile, getComponentName } = useAuth();
  const [componentName, setComponentName] = useState<string | null>(null);
  const { data: submissions, isLoading } = useComponentSubmissions(profile?.component_id || undefined);
  const { isSubmissionsOpenOverride } = useSettings();
  const navigate = useNavigate();

  const isWindowOpen = isSubmissionWindowOpen(isSubmissionsOpenOverride);

  useEffect(() => {
    getComponentName().then(setComponentName);
  }, [getComponentName]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  const submittedCount = submissions?.length || 0;
  const pendingMonths = 12 - submittedCount;
  const scoredSubmissions = submissions?.filter(s => s.score !== null) || [];
  const averageScore = scoredSubmissions.length > 0
    ? scoredSubmissions.reduce((acc, s) => acc + (s.score || 0), 0) / scoredSubmissions.length
    : 0;

  return (
    <DashboardLayout>
      <PageHeader
        title="Welcome back"
        description={componentName || 'Your component dashboard'}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
        <StatCard
          title="Reports Submitted"
          value={`${submittedCount}/12`}
          subtitle="This year"
          icon={FileText}
        />
        <StatCard
          title="Pending Reports"
          value={pendingMonths > 0 ? pendingMonths : 0}
          subtitle="Remaining"
          icon={Clock}
        />
        <StatCard
          title="Average Score"
          value={averageScore > 0 ? `${Math.round(averageScore)}%` : '—'}
          subtitle="All submissions"
          icon={TrendingUp}
        />
      </div>

      {/* Submission History with Review Cards */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="premium-card overflow-hidden"
      >
        <div className="p-4 md:p-5 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Your Submissions</h2>
            <p className="text-sm text-muted-foreground">History and review status</p>
          </div>
          {isWindowOpen && (
            <Button size="sm" onClick={() => navigate('/upload')} className="w-full sm:w-auto">
              Submit New Report
            </Button>
          )}
        </div>

        {submissions && submissions.length > 0 ? (
          <div className="p-4 space-y-3">
            {submissions.map((submission) => (
              <SubmissionReviewCard key={submission.id} submission={submission} />
            ))}
          </div>
        ) : (
          <div className="p-8 md:p-12 text-center">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-muted mb-4">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">No submissions yet</h3>
            <p className="text-sm text-red-500 max-w-sm mx-auto mb-4">
              {isWindowOpen
                ? "Submit your first monthly activity report"
                : "Submissions are currently closed. You can submit reports from the 25th of the month to the 1st of the following month. All submissions are considered late submissions after that."}
            </p>
            {isWindowOpen && <Button onClick={() => navigate('/upload')}>Submit Report</Button>}
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
}

export default function Dashboard() {
  const { isAdmin } = useAuth();

  return isAdmin ? <AdminDashboard /> : <MemberDashboard />;
}
