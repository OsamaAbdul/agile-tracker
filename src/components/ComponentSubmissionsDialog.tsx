import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useComponentSubmissions } from "@/hooks/useSubmissions";
import { MONTHS, getSubmissionStatus } from "@/types";
import { StatusBadge } from "@/components/StatusBadge";
import { FileViewButton } from "@/components/FileViewButton";
import { FileDownloadButton } from "@/components/FileDownloadButton";
import { EmptyState } from "@/components/EmptyState";
import { Loader2, FileText, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { Submission } from '@/hooks/useSubmissions';

interface ComponentSubmissionsDialogProps {
    componentId: string | null;
    componentName: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ComponentSubmissionsDialog({
    componentId,
    componentName,
    open,
    onOpenChange,
}: ComponentSubmissionsDialogProps) {
    const { data: submissions, isLoading } = useComponentSubmissions(componentId || undefined);

    const getReviewStatusIcon = (submission: Submission) => {
        if (submission.score !== null) {
            return <CheckCircle className="h-4 w-4 text-primary" />;
        }
        if (submission.feedback) {
            return <Clock className="h-4 w-4 text-warning" />;
        }
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Submissions: {componentName}</DialogTitle>
                    <DialogDescription>
                        View all activity reports submitted by this component.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-auto min-h-[300px]">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-48">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : submissions && submissions.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Period</TableHead>
                                    <TableHead>File</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Review</TableHead>
                                    <TableHead>Submitted</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {submissions.map((submission) => {
                                    const status = getSubmissionStatus(submission as any, submission.month, submission.year);
                                    return (
                                        <TableRow key={submission.id}>
                                            <TableCell className="font-medium">
                                                {MONTHS[submission.month - 1]} {submission.year}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-sm truncate max-w-[150px]" title={submission.file_name}>
                                                        {submission.file_name}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <StatusBadge status={status} />
                                            </TableCell>
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
                                            <TableCell className="text-muted-foreground text-sm">
                                                {new Date(submission.submitted_at).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <FileViewButton fileUrl={submission.file_url} className="h-8 w-8" />
                                                    <FileDownloadButton fileUrl={submission.file_url} fileName={submission.file_name} className="h-8 w-8" />
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
                            description="This component hasn't submitted any reports yet."
                            icon="document"
                        />
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
