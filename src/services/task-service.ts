import { db } from '@/config/firebase';
import type { EmployeeMember } from '@/types/company';
import type { NewTask, Task, TaskNote, TaskPriority } from '@/types/task';
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  where,
} from 'firebase/firestore';

export type TaskAccess = { uid: string; companyId: string; isAdmin: boolean };
type TaskAction = 'complete' | 'archive' | 'reopen';

const storedPriorities = {
  'Alta Prioridade': 'alta',
  Rotina: 'media',
  Baixa: 'baixa',
} as const satisfies Record<TaskPriority, string>;

type StoredPriority = (typeof storedPriorities)[TaskPriority];
type StoredTask = Omit<Task, 'id' | 'companyId' | 'title' | 'priority' | 'status' | 'reopenedAt'> & {
  name: string;
  category: string;
  priority: StoredPriority;
  status: 'pending' | 'completed';
};

const taskPriorities: Record<StoredPriority, TaskPriority> = {
  alta: 'Alta Prioridade',
  media: 'Rotina',
  baixa: 'Baixa',
};

function tasksCollection(companyId: string) {
  return collection(db, 'companies', companyId, 'tasks');
}

function toTask(companyId: string, taskId: string, data: StoredTask): Task {
  const wasReopened = data.status === 'pending' && data.updatedAt && data.createdAt
    && data.updatedAt.toMillis() > data.createdAt.toMillis();

  return {
    id: taskId,
    companyId,
    assigneeUid: data.assigneeUid,
    assigneeName: data.assigneeName,
    createdByUid: data.createdByUid,
    title: data.name,
    description: data.description,
    sector: data.sector,
    dueDate: data.dueDate,
    priority: taskPriorities[data.priority] ?? 'Rotina',
    status: data.status === 'completed' && data.archivedAt ? 'archived' : data.status,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    completedAt: data.completedAt ?? null,
    archivedAt: data.archivedAt ?? null,
    reopenedAt: wasReopened ? data.updatedAt : null,
  };
}

export function subscribeToTasks(
  access: TaskAccess,
  onTasks: (tasks: Task[]) => void,
  onError: (error: Error) => void
) {
  const companyTasks = tasksCollection(access.companyId);
  const tasksQuery = access.isAdmin
    ? companyTasks
    : query(companyTasks, where('assigneeUid', '==', access.uid));

  return onSnapshot(tasksQuery, (snapshot) => {
    const tasks = snapshot.docs.map((item) => toTask(
      access.companyId,
      item.id,
      item.data({ serverTimestamps: 'estimate' }) as StoredTask
    ));
    tasks.sort((a, b) => (b.createdAt?.toMillis() ?? 0) - (a.createdAt?.toMillis() ?? 0));
    onTasks(tasks);
  }, onError);
}

export async function createTask(access: TaskAccess, input: NewTask, assignee: EmployeeMember) {
  if (!access.isAdmin || assignee.companyId !== access.companyId ||
      assignee.status !== 'active' || assignee.isInvite || !assignee.uid) {
    throw new Error('Selecione um membro ativo da sua empresa.');
  }

  await addDoc(tasksCollection(access.companyId), {
    name: input.title,
    description: input.description,
    sector: input.sector,
    dueDate: input.dueDate,
    priority: storedPriorities[input.priority],
    category: input.priority,
    assigneeUid: assignee.uid,
    assigneeName: assignee.name,
    createdByUid: access.uid,
    status: 'pending',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    completedAt: null,
    archivedAt: null,
  });
}

export async function changeTaskStatus(access: TaskAccess, taskId: string, action: TaskAction) {
  const ref = doc(tasksCollection(access.companyId), taskId);
  await runTransaction(db, async (transaction) => {
    const task = (await transaction.get(ref)).data() as StoredTask | undefined;
    if (!task) {
      throw new Error('Tarefa não encontrada para sua empresa.');
    }

    if (action === 'complete') {
      if (task.assigneeUid !== access.uid) throw new Error('Somente o responsável pode concluir a tarefa.');
      if (task.status !== 'pending') return;
      transaction.update(ref, {
        status: 'completed',
        completedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return;
    }

    if (!access.isAdmin) throw new Error('Somente gestores podem validar ou reabrir tarefas.');

    if (action === 'archive') {
      if (task.archivedAt) return;
      if (task.status !== 'completed') throw new Error('A tarefa precisa estar concluída para ser validada.');
      transaction.update(ref, {
        archivedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return;
    }

    if (task.status === 'pending') return;
    transaction.update(ref, {
      status: 'pending',
      completedAt: null,
      ...(task.archivedAt ? { archivedAt: null } : {}),
      updatedAt: serverTimestamp(),
    });
  });
}

function notesCollection(companyId: string, taskId: string) {
  return collection(db, 'companies', companyId, 'tasks', taskId, 'messages');
}

export function subscribeToTaskNotes(
  companyId: string,
  taskId: string,
  onNotes: (notes: TaskNote[]) => void,
  onError: (error: Error) => void
) {
  return onSnapshot(query(notesCollection(companyId, taskId), orderBy('createdAt')), (snapshot) => {
    onNotes(snapshot.docs.map((item) => ({
      ...(item.data({ serverTimestamps: 'estimate' }) as Omit<TaskNote, 'id'>),
      id: item.id,
    })));
  }, onError);
}

export async function addTaskNote(taskId: string, profile: EmployeeMember, content: string) {
  await addDoc(notesCollection(profile.companyId, taskId), {
    authorUid: profile.uid,
    author: profile.name,
    role: profile.jobTitle,
    content,
    createdAt: serverTimestamp(),
  });
}

export function taskErrorMessage(error: unknown, fallback: string): string {
  const code = (error as { code?: string } | null)?.code;
  if (code === 'permission-denied') return 'Sem permissão para acessar estas tarefas no Firestore.';
  if (!code && error instanceof Error) return error.message;
  return fallback;
}
