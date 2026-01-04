import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Upload as UploadIcon, FileText, X, CheckCircle2, AlertCircle, Loader2, Calendar } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { PageHeader } from '@/components/PageHeader';
import { useAuth } from '@/contexts/AuthContext';
import { useCreateSubmission } from '@/hooks/useSubmissions';
import { MONTHS, getSubmissionDeadline } from '@/types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const ALLOWED_FILE_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function Upload() {
  const { profile, getComponentName } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const createSubmission = useCreateSubmission();
  const [componentName, setComponentName] = useState<string | null>(null);

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [selectedMonth, setSelectedMonth] = useState<string>(String(currentMonth));
  const [selectedYear] = useState<number>(currentYear);
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    getComponentName().then(setComponentName);
  }, [getComponentName]);

  const deadline = getSubmissionDeadline(parseInt(selectedMonth), selectedYear);
  const isLate = new Date() > deadline;

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return 'Only PDF and DOCX files are allowed';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'File size must be less than 10MB';
    }
    return null;
  };

  const handleFileSelect = useCallback((selectedFile: File) => {
    const error = validateFile(selectedFile);
    if (error) {
      toast({
        title: 'Invalid File',
        description: error,
        variant: 'destructive',
      });
      return;
    }
    setFile(selectedFile);
  }, [toast]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  }, [handleFileSelect]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleSubmit = async () => {
    if (!file || !profile?.component_id) {
      toast({
        title: 'Error',
        description: 'You must be assigned to a component to submit reports.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createSubmission.mutateAsync({
        component_id: profile.component_id,
        month: parseInt(selectedMonth),
        year: selectedYear,
        file,
      });

      setFile(null);
      navigate('/dashboard');
    } catch (error) {
      // Error handled by mutation
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (!profile?.component_id) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-64 text-center px-4">
          <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <AlertCircle className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-2">Not Assigned to a Component</h2>
          <p className="text-muted-foreground max-w-md text-sm">
            You need to be assigned to a component before you can submit reports.
            Please contact your administrator.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="Submit Report"
        description={`Upload your monthly activity report for ${componentName || 'your component'}`}
      />

      <div className="max-w-2xl space-y-4 md:space-y-6">
        {/* Month Selection */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="premium-card p-4 md:p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-5 w-5 text-primary" />
            <Label className="text-base font-semibold">Report Period</Label>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-full sm:w-48 h-12">
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((month, index) => (
                  <SelectItem key={month} value={String(index + 1)}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-lg font-semibold text-foreground">{selectedYear}</span>
          </div>

          <div className={`mt-4 p-4 rounded-xl flex items-start gap-3 ${isLate
              ? 'bg-orange-500/10 border border-orange-500/20'
              : 'bg-primary/10 border border-primary/20'
            }`}>
            {isLate ? (
              <AlertCircle className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            )}
            <div>
              <p className={`text-sm font-semibold ${isLate ? 'text-orange-600' : 'text-primary'}`}>
                {isLate ? 'Submission deadline has passed' : 'On-time submission'}
              </p>
              <p className={`text-xs ${isLate ? 'text-orange-500/80' : 'text-primary/70'}`}>
                Deadline: {deadline.toLocaleDateString('en-NG', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>
        </motion.div>

        {/* File Upload */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="premium-card p-4 md:p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <UploadIcon className="h-5 w-5 text-primary" />
            <Label className="text-base font-semibold">Upload Report</Label>
          </div>

          {!file ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`
                relative border-2 border-dashed rounded-xl p-8 md:p-12 text-center transition-all duration-200
                ${isDragging
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50 hover:bg-muted/30'
                }
              `}
            >
              <input
                type="file"
                accept=".pdf,.docx"
                onChange={handleInputChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center">
                <div className="p-4 bg-primary/10 rounded-2xl mb-4">
                  <UploadIcon className="h-8 w-8 text-primary" />
                </div>
                <p className="text-sm font-medium text-foreground mb-1">
                  Drop your file here, or click to browse
                </p>
                <p className="text-xs text-muted-foreground">
                  PDF or DOCX, max 10MB
                </p>
              </div>
            </div>
          ) : (
            <div className="border border-border rounded-xl p-4 bg-muted/30">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-xl shrink-0">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{file.name}</p>
                  <p className="text-sm text-muted-foreground">{formatFileSize(file.size)}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setFile(null)}
                  className="shrink-0 h-10 w-10"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleSubmit}
              disabled={!file || createSubmission.isPending}
              className="flex-1 h-12"
            >
              {createSubmission.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                'Submit Report'
              )}
            </Button>
            {file && (
              <Button variant="outline" onClick={() => setFile(null)} className="h-12">
                Cancel
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
