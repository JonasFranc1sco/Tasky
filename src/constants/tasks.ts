export type Assignee = { name: string; uid?: string };

export type TaskNote = {
  id: string;
  author: string;
  authorUid?: string;
  role: string;
  timestamp: string;
  content: string;
};

export type Task = {
  id: string;
  name: string;
  description: string;
  dueDate: string;
  assignee: Assignee;
  completedAt: string | null;
  priority?: 'alta' | 'media' | 'baixa';
  sector?: string;
  checklist?: { done: number; total: number; location: string };
  reopened?: boolean;
  reopenReason?: string;
  category?: string;
  createdAt?: string;
};
