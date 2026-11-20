import { db } from '@/config/firebase';
import type { Task, TaskNote } from '@/constants/tasks';
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type DocumentData,
  type Timestamp,
} from 'firebase/firestore';

type StoredTask = DocumentData & {
  name?: string;
  description?: string;
  dueDate?: string;
  assigneeUid?: string;
  assigneeName?: string;
  completedAt?: Timestamp | null;
  createdAt?: Timestamp;
};

function asIsoString(value?: Timestamp | null) {
  return value?.toDate?.().toISOString() ?? null;
}

function toTask(id: string, data: StoredTask): Task {
  return {
    id,
    name: data.name ?? '',
    description: data.description ?? '',
    dueDate: data.dueDate ?? '',
    assignee: {
      name: data.assigneeName ?? 'Colaborador',
      uid: data.assigneeUid,
    },
    completedAt: asIsoString(data.completedAt),
    createdAt: asIsoString(data.createdAt) ?? undefined,
    priority: data.priority,
    sector: data.sector,
    checklist: data.checklist,
    reopened: data.reopened,
    reopenReason: data.reopenReason,
    category: data.category,
  };
}

function toTaskNote(id: string, data: DocumentData): TaskNote {
  const createdAt = data.createdAt as Timestamp | undefined;
  return {
    id,
    author: typeof data.author === 'string' ? data.author : 'Gestor',
    authorUid: typeof data.authorUid === 'string' ? data.authorUid : undefined,
    role: typeof data.role === 'string' ? data.role : 'Supervisor',
    timestamp: createdAt?.toDate
      ? createdAt.toDate().toLocaleString('pt-BR', {
          dateStyle: 'short',
          timeStyle: 'short',
        })
      : 'Agora',
    content: typeof data.content === 'string' ? data.content : '',
  };
}

export class TaskService {
  static subscribeToCompanyTasks(
    companyId: string,
    userUid: string,
    isAdmin: boolean,
    onUpdate: (tasks: Task[]) => void,
    onError?: (error: Error) => void
  ) {
    const tasksRef = collection(db, 'companies', companyId, 'tasks');
    const tasksQuery = isAdmin
      ? query(tasksRef)
      : query(tasksRef, where('assigneeUid', '==', userUid));

    return onSnapshot(
      tasksQuery,
      (snapshot) => {
        const tasks = snapshot.docs
          .map((item) => toTask(item.id, item.data()))
          .sort((a, b) =>
            (b.createdAt ?? '').localeCompare(a.createdAt ?? '')
          );
        onUpdate(tasks);
      },
      (error) => onError?.(error)
    );
  }

  static async createTask(
    companyId: string,
    createdByUid: string,
    task: Omit<Task, 'id' | 'createdAt' | 'completedAt'>
  ) {
    const assigneeUid = task.assignee.uid;
    if (!assigneeUid) {
      throw new Error('Selecione um colaborador com conta ativa.');
    }

    const tasksRef = collection(db, 'companies', companyId, 'tasks');
    await addDoc(tasksRef, {
      name: task.name.trim(),
      description: task.description.trim(),
      dueDate: task.dueDate.trim(),
      assigneeUid,
      assigneeName: task.assignee.name,
      sector: task.sector ?? '',
      priority: task.priority ?? 'media',
      category: task.category ?? 'Rotina',
      status: 'pending',
      completedAt: null,
      createdByUid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  static async updateTaskStatus(
    companyId: string,
    taskId: string,
    status: 'pending' | 'completed'
  ) {
    await updateDoc(doc(db, 'companies', companyId, 'tasks', taskId), {
      status,
      completedAt: status === 'completed' ? serverTimestamp() : null,
      updatedAt: serverTimestamp(),
    });
  }

  static subscribeToTaskNotes(
    companyId: string,
    taskId: string,
    onUpdate: (notes: TaskNote[]) => void,
    onError?: (error: Error) => void
  ) {
    const notesRef = collection(
      db,
      'companies',
      companyId,
      'tasks',
      taskId,
      'messages'
    );
    const notesQuery = query(notesRef, orderBy('createdAt', 'asc'));

    return onSnapshot(
      notesQuery,
      (snapshot) => onUpdate(snapshot.docs.map((item) => toTaskNote(item.id, item.data()))),
      (error) => onError?.(error)
    );
  }

  static async addTaskNote(
    companyId: string,
    taskId: string,
    note: Omit<TaskNote, 'id' | 'timestamp'>
  ) {
    const notesRef = collection(
      db,
      'companies',
      companyId,
      'tasks',
      taskId,
      'messages'
    );
    await addDoc(notesRef, {
      author: note.author,
      authorUid: note.authorUid ?? '',
      role: note.role,
      content: note.content.trim(),
      createdAt: serverTimestamp(),
    });
  }
}
