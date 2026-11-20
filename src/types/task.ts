import type { Timestamp } from 'firebase/firestore';

export type TaskPriority = 'Alta Prioridade' | 'Rotina' | 'Baixa';
export type TaskStatus = 'pending' | 'completed' | 'archived';

export type Task = {
  id: string;
  companyId: string;
  assigneeUid: string;
  assigneeName: string;
  createdByUid: string;
  title: string;
  description: string;
  sector: string;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
  completedAt: Timestamp | null;
  reopened: boolean;
  reopenedAt: Timestamp | null;
  reopenReason?: string;
  checklist?: { done: number; total: number; location: string };
  archivedAt: Timestamp | null;
  deleting: boolean;
};

export type NewTask = Pick<Task, 'title' | 'description' | 'sector' | 'dueDate' | 'priority'>;

export type TaskNote = {
  id: string;
  authorUid: string;
  author: string;
  role: string;
  content: string;
  createdAt: Timestamp | null;
};

export function formatTaskDate(value: Timestamp | null): string {
  return value?.toDate().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) ?? '—';
}
