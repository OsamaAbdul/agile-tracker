export type UserRole = 'admin' | 'member';

export type SubmissionStatus = 'submitted' | 'pending' | 'late' | 'missing';

export interface Component {
  id: string;
  name: string;
  email: string;
  phone: string;
  registration_token?: string;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  component_id?: string;
  created_at: string;
}

export interface Submission {
  id: string;
  component_id: string;
  month: number; // 1-12
  year: number;
  file_url: string;
  file_name: string;
  submitted_at: string;
  is_late: boolean;
  score?: number;
  feedback?: string;
  reviewed_at?: string;
  reviewed_by?: string;
}

export interface MonthlyDeadline {
  month: number;
  year: number;
  deadline: Date;
  label: string;
}

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
] as const;

export function getSubmissionDeadline(month: number, year: number): Date {
  // Activity for month X is due on the 1st of month X+1
  const deadlineMonth = month === 12 ? 0 : month;
  const deadlineYear = month === 12 ? year + 1 : year;
  return new Date(deadlineYear, deadlineMonth, 1, 23, 59, 59);
}

export function isSubmissionLate(submittedAt: Date, month: number, year: number): boolean {
  const deadline = getSubmissionDeadline(month, year);
  return submittedAt > deadline;
}

export function getSubmissionStatus(
  submission: Submission | null | undefined,
  month: number,
  year: number
): SubmissionStatus {
  const now = new Date();
  const deadline = getSubmissionDeadline(month, year);
  
  if (!submission) {
    return now > deadline ? 'missing' : 'pending';
  }
  
  return submission.is_late ? 'late' : 'submitted';
}
