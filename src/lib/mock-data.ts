import { Component, Submission, User, MONTHS } from '@/types';

export const mockComponents: Component[] = [
  {
    id: '1',
    name: 'Education Support Unit',
    email: 'education@agile.gov.ng',
    phone: '+234 803 123 4567',
    created_at: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    name: 'Health & Nutrition',
    email: 'health@agile.gov.ng',
    phone: '+234 803 234 5678',
    created_at: '2024-01-16T10:00:00Z',
  },
  {
    id: '3',
    name: 'Economic Empowerment',
    email: 'economic@agile.gov.ng',
    phone: '+234 803 345 6789',
    created_at: '2024-01-17T10:00:00Z',
  },
  {
    id: '4',
    name: 'Community Engagement',
    email: 'community@agile.gov.ng',
    phone: '+234 803 456 7890',
    created_at: '2024-02-01T10:00:00Z',
  },
  {
    id: '5',
    name: 'Monitoring & Evaluation',
    email: 'monitoring@agile.gov.ng',
    phone: '+234 803 567 8901',
    created_at: '2024-02-15T10:00:00Z',
  },
];

export const mockUsers: User[] = [
  {
    id: 'admin-1',
    email: 'admin@agile.gov.ng',
    full_name: 'Program Administrator',
    role: 'admin',
    created_at: '2024-01-01T10:00:00Z',
  },
  {
    id: 'user-1',
    email: 'john.edu@agile.gov.ng',
    full_name: 'John Adebayo',
    role: 'member',
    component_id: '1',
    created_at: '2024-01-20T10:00:00Z',
  },
  {
    id: 'user-2',
    email: 'sarah.edu@agile.gov.ng',
    full_name: 'Sarah Okonkwo',
    role: 'member',
    component_id: '1',
    created_at: '2024-01-21T10:00:00Z',
  },
  {
    id: 'user-3',
    email: 'michael.health@agile.gov.ng',
    full_name: 'Michael Ibrahim',
    role: 'member',
    component_id: '2',
    created_at: '2024-01-22T10:00:00Z',
  },
];

export const mockSubmissions: Submission[] = [
  {
    id: 'sub-1',
    component_id: '1',
    month: 1,
    year: 2024,
    file_url: '/files/education-jan-2024.pdf',
    file_name: 'Education_January_2024_Report.pdf',
    submitted_at: '2024-01-28T14:30:00Z',
    is_late: false,
    score: 85,
    feedback: 'Comprehensive report with good data visualization. Consider adding more qualitative insights.',
    reviewed_at: '2024-02-05T10:00:00Z',
    reviewed_by: 'admin-1',
  },
  {
    id: 'sub-2',
    component_id: '1',
    month: 2,
    year: 2024,
    file_url: '/files/education-feb-2024.pdf',
    file_name: 'Education_February_2024_Report.pdf',
    submitted_at: '2024-03-02T09:15:00Z',
    is_late: true,
    score: 72,
    feedback: 'Report submitted late. Content is adequate but missing key metrics.',
    reviewed_at: '2024-03-10T11:00:00Z',
    reviewed_by: 'admin-1',
  },
  {
    id: 'sub-3',
    component_id: '2',
    month: 1,
    year: 2024,
    file_url: '/files/health-jan-2024.pdf',
    file_name: 'Health_January_2024_Report.pdf',
    submitted_at: '2024-01-30T16:45:00Z',
    is_late: false,
    score: 92,
    feedback: 'Excellent report. Well-structured with clear outcomes.',
    reviewed_at: '2024-02-06T14:00:00Z',
    reviewed_by: 'admin-1',
  },
  {
    id: 'sub-4',
    component_id: '3',
    month: 1,
    year: 2024,
    file_url: '/files/economic-jan-2024.docx',
    file_name: 'Economic_January_2024_Report.docx',
    submitted_at: '2024-01-31T23:50:00Z',
    is_late: false,
  },
];

export function getComponentSubmissions(componentId: string): Submission[] {
  return mockSubmissions.filter(s => s.component_id === componentId);
}

export function getMonthlySubmissionStats(month: number, year: number) {
  const submissions = mockSubmissions.filter(s => s.month === month && s.year === year);
  const submitted = submissions.filter(s => !s.is_late).length;
  const late = submissions.filter(s => s.is_late).length;
  const missing = mockComponents.length - submissions.length;
  
  return { submitted, late, missing, total: mockComponents.length };
}
