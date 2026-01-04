import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, MessageSquare, Filter, Calendar, Loader2, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { EmptyState } from '@/components/EmptyState';
import { SubmissionFeedbackDialog } from '@/components/SubmissionFeedbackDialog';
import { FileViewButton } from '@/components/FileViewButton';
import { FileDownloadButton } from '@/components/FileDownloadButton';
import { useComponents } from '@/hooks/useComponents';
import { useSubmissions, useReviewSubmission, Submission } from '@/hooks/useSubmissions';
import { useUnreadMessages } from '@/hooks/useSubmissionMessages';
import { getSignedUrlAsync } from '@/hooks/useSignedUrl';
import { MONTHS, getSubmissionStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';

export default function Submissions() {
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedComponent, setSelectedComponent] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [reviewingSubmission, setReviewingSubmission] = useState<Submission | null>(null);
  const [feedbackSubmission, setFeedbackSubmission] = useState<Submission | null>(null);
  const [score, setScore] = useState<number[]>([75]);
  const [feedback, setFeedback] = useState('');
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false);

  const { data: components, isLoading: isLoadingComponents } = useComponents();
  const { data: submissions, isLoading: isLoadingSubmissions } = useSubmissions();
  const reviewSubmission = useReviewSubmission();

  // Get message counts
  const submissionIds = submissions?.map(s => s.id) || [];
  const { data: messageCounts } = useUnreadMessages(submissionIds);

  const currentYear = new Date().getFullYear();

  const filteredSubmissions = submissions?.filter(submission => {
    if (selectedMonth !== 'all' && submission.month !== parseInt(selectedMonth)) return false;
    if (selectedComponent !== 'all' && submission.component_id !== selectedComponent) return false;
    if (selectedStatus !== 'all') {
      const status = getSubmissionStatus(submission as any, submission.month, submission.year);
      if (status !== selectedStatus) return false;
    }
    return true;
  }).sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()) || [];

  const handleReview = async () => {
    if (!reviewingSubmission) return;

    try {
      await reviewSubmission.mutateAsync({
        id: reviewingSubmission.id,
        score: score[0],
        feedback,
      });
      setIsReviewDialogOpen(false);
      setReviewingSubmission(null);
      setScore([75]);
      setFeedback('');
    } catch (error) {
      // Error handled by mutation
    }
  };

  const openReviewDialog = (submission: Submission) => {
    setReviewingSubmission(submission);
    setScore([submission.score || 75]);
    setFeedback(submission.feedback || '');
    setIsReviewDialogOpen(true);
  };

  const openFeedbackDialog = (submission: Submission) => {
    setFeedbackSubmission(submission);
    setIsFeedbackDialogOpen(true);
  };

  const getReviewStatusIcon = (submission: Submission) => {
    if (submission.score !== null) {
      return <CheckCircle className="h-4 w-4 text-primary" />;
    }
    if (submission.feedback) {
      return <Clock className="h-4 w-4 text-warning" />;
    }
    return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
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
        title="Submissions"
        description="Review and assess component activity reports"
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row flex-wrap gap-2 md:gap-3 mb-6">
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-full sm:w-40">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue placeholder="All Months" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Months</SelectItem>
            {MONTHS.map((month, index) => (
              <SelectItem key={month} value={String(index + 1)}>
                {month}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedComponent} onValueChange={setSelectedComponent}>
          <SelectTrigger className="w-full sm:w-52">
            <SelectValue placeholder="All Components" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Components</SelectItem>
            {components?.map(component => (
              <SelectItem key={component.id} value={component.id}>
                {component.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-full sm:w-36">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="submitted">Submitted</SelectItem>
            <SelectItem value="late">Late</SelectItem>
            <SelectItem value="missing">Missing</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-3">
        {filteredSubmissions.map((submission, index) => {
          const component = components?.find(c => c.id === submission.component_id);
          const status = getSubmissionStatus(submission as any, submission.month, submission.year);
          const messageCount = messageCounts?.[submission.id] || 0;

          return (
            <motion.div
              key={submission.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="premium-card p-4"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-primary">
                        {component?.name.charAt(0) || '?'}
                      </span>
                    </div>
                    <p className="font-semibold text-foreground truncate">{component?.name || 'Unknown'}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">{MONTHS[submission.month - 1]} {submission.year}</p>
                </div>
                <StatusBadge status={status} />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border">
                <div className="flex items-center gap-2 text-sm">
                  {getReviewStatusIcon(submission)}
                  {submission.score !== null ? (
                    <span className="font-semibold">{submission.score}/100</span>
                  ) : (
                    <span className="text-muted-foreground">Pending review</span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <FileViewButton fileUrl={submission.file_url} className="h-8 w-8" />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 relative"
                    onClick={() => openFeedbackDialog(submission)}
                  >
                    <MessageSquare className="h-4 w-4" />
                    {messageCount > 0 && (
                      <Badge
                        variant="default"
                        className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]"
                      >
                        {messageCount}
                      </Badge>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => openReviewDialog(submission)}
                  >
                    {submission.score !== null ? 'Edit' : 'Score'}
                  </Button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Desktop Table */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="hidden lg:block premium-card overflow-hidden"
      >
        {filteredSubmissions.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="data-table-header">Component</TableHead>
                <TableHead className="data-table-header">Period</TableHead>
                <TableHead className="data-table-header">File</TableHead>
                <TableHead className="data-table-header">Status</TableHead>
                <TableHead className="data-table-header">Review</TableHead>
                <TableHead className="data-table-header">Submitted</TableHead>
                <TableHead className="data-table-header">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubmissions.map((submission) => {
                const component = components?.find(c => c.id === submission.component_id);
                const status = getSubmissionStatus(submission as any, submission.month, submission.year);
                const messageCount = messageCounts?.[submission.id] || 0;

                return (
                  <TableRow key={submission.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                          <span className="text-xs font-bold text-primary">
                            {component?.name.charAt(0) || '?'}
                          </span>
                        </div>
                        <span className="font-medium">{component?.name || 'Unknown'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{MONTHS[submission.month - 1]} {submission.year}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm truncate max-w-32">{submission.file_name}</span>
                      </div>
                    </TableCell>
                    <TableCell><StatusBadge status={status} /></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getReviewStatusIcon(submission)}
                        {submission.score !== null ? (
                          <span className="font-semibold text-sm">{submission.score}/100</span>
                        ) : (
                          <span className="text-xs text-muted-foreground">Pending</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(submission.submitted_at).toLocaleDateString('en-NG', {
                        day: 'numeric',
                        month: 'short'
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <FileViewButton fileUrl={submission.file_url} className="h-8 w-8" />
                        <FileDownloadButton fileUrl={submission.file_url} fileName={submission.file_name} className="h-8 w-8" />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 relative"
                          title="Feedback Messages"
                          onClick={() => openFeedbackDialog(submission)}
                        >
                          <MessageSquare className="h-4 w-4" />
                          {messageCount > 0 && (
                            <Badge
                              variant="default"
                              className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]"
                            >
                              {messageCount}
                            </Badge>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs"
                          onClick={() => openReviewDialog(submission)}
                        >
                          {submission.score !== null ? 'Edit' : 'Score'}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <EmptyState
            title="No submissions found"
            description="Try adjusting your filters or check back later"
            icon="document"
          />
        )}
      </motion.div>

      {/* Empty state for mobile */}
      {filteredSubmissions.length === 0 && (
        <div className="lg:hidden">
          <EmptyState
            title="No submissions found"
            description="Try adjusting your filters or check back later"
            icon="document"
          />
        </div>
      )}

      {/* Review Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Review Submission</DialogTitle>
            <DialogDescription>
              {reviewingSubmission && (
                <>
                  {components?.find(c => c.id === reviewingSubmission.component_id)?.name} — {MONTHS[reviewingSubmission.month - 1]} {reviewingSubmission.year}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Score</Label>
                <span className="text-2xl font-bold text-primary">{score[0]}/100</span>
              </div>
              <Slider
                value={score}
                onValueChange={setScore}
                max={100}
                step={1}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="feedback">Feedback</Label>
              <Textarea
                id="feedback"
                placeholder="Provide structured feedback on this submission..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={4}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                className="flex-1 h-11"
                onClick={handleReview}
                disabled={reviewSubmission.isPending}
              >
                {reviewSubmission.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Review'
                )}
              </Button>
              <Button variant="outline" className="h-11" onClick={() => setIsReviewDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Feedback Messages Dialog */}
      <SubmissionFeedbackDialog
        submission={feedbackSubmission}
        componentName={components?.find(c => c.id === feedbackSubmission?.component_id)?.name || ''}
        open={isFeedbackDialogOpen}
        onOpenChange={setIsFeedbackDialogOpen}
      />
    </DashboardLayout>
  );
}
