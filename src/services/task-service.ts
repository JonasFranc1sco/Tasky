import { db } from '@/config/firebase';
import type { EmployeeMember } from '@/types/company';
import type { NewTask, Task, TaskNote, TaskPriority } from '@/types/task';
import {
  addDoc,
  collection,
  doc,
  getDocsFromServer,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  where,
  writeBatch,
} from 'firebase/firestore';

export type TaskAccess = { uid: string; companyId: string; isAdmin: boolean };
type TaskAction = 'complete' | 'archive' | 'reopen';

const storedPriorities = {
  'Alta Prioridade': 'alta',
  Rotina: 'media',
  Baixa: 'baixa',
} as const satisfies Record<TaskPriority, string>;

type StoredPriority = (typeof storedPriorities)[TaskPriority];
type StoredTask = Partial<Omit<Task, 'id' | 'companyId' | 'title' | 'priority' | 'status' | 'reopenedAt'>> & {
  name?: string;
  priority?: StoredPriority;
  status?: 'pending' | 'completed';
};

const taskPriorities: Record<StoredPriority, TaskPriority> = {
  alta: 'Alta Prioridade',
  media: 'Rotina',
  baixa: 'Baixa',
};

function tasksCollection(companyId: string) {
  return collection(db, 'companies', companyId, 'tasks');
}

function storedTaskStatus(task: StoredTask) {
  return task.status ?? (task.completedAt ? 'completed' : 'pending');
}

function toTask(companyId: string, taskId: string, data: StoredTask): Task {
  const status = storedTaskStatus(data);
  const wasReopened = status === 'pending' && data.updatedAt && data.createdAt
    && data.updatedAt.toMillis() > data.createdAt.toMillis();

  return {
    id: taskId,
    companyId,
    assigneeUid: data.assigneeUid ?? '',
    assigneeName: data.assigneeName ?? 'Colaborador',
    createdByUid: data.createdByUid ?? '',
    title: data.name ?? '',
    description: data.description ?? '',
    sector: data.sector ?? '',
    dueDate: data.dueDate ?? '',
    priority: (data.priority && taskPriorities[data.priority]) ?? 'Rotina',
    status: status === 'completed' && data.archivedAt ? 'archived' : status,
    createdAt: data.createdAt ?? null,
    updatedAt: data.updatedAt ?? null,
    completedAt: data.completedAt ?? null,
    archivedAt: data.archivedAt ?? null,
    reopened: status === 'pending' && (Boolean(wasReopened) || data.reopened === true),
    reopenedAt: wasReopened ? data.updatedAt ?? null : null,
    reopenReason: data.reopenReason,
    checklist: data.checklist,
    deleting: data.deleting === true,
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
    if (task.deleting) {
      throw new Error('A tarefa está em processo de exclusão.');
    }
    const status = storedTaskStatus(task);

    if (action === 'complete') {
      if (!access.isAdmin && task.assigneeUid !== access.uid) {
        throw new Error('Somente o responsável ou um gestor pode concluir a tarefa.');
      }
      if (status !== 'pending') return;
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
      if (status !== 'completed' || !task.completedAt) {
        throw new Error('A tarefa precisa estar concluída para ser validada.');
      }
      transaction.update(ref, {
        archivedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return;
    }

    if (status === 'pending') return;
    transaction.update(ref, {
      status: 'pending',
      completedAt: null,
      ...(task.archivedAt ? { archivedAt: null } : {}),
      updatedAt: serverTimestamp(),
    });
  });
}

export async function deleteTask(access: TaskAccess, taskId: string) {
  if (!access.isAdmin) throw new Error('Apenas gestores podem excluir tarefas.');
  const ref = doc(tasksCollection(access.companyId), taskId);

  const exists = await runTransaction(db, async (transaction) => {
    const task = await transaction.get(ref);
    if (!task.exists()) return false;
    // As regras bloqueiam novas observações a partir deste ponto, inclusive entre lotes.
    if (!task.get('deleting')) transaction.update(ref, { deleting: true });
    return true;
  });
  if (!exists) return;

  const notes = query(notesCollection(access.companyId, taskId), limit(450));
  let snapshot = await getDocsFromServer(notes);
  while (!snapshot.empty) {
    const batch = writeBatch(db);
    snapshot.docs.forEach((note) => batch.delete(note.ref));
    await batch.commit();
    snapshot = await getDocsFromServer(notes);
  }

  await runTransaction(db, async (transaction) => {
    if ((await transaction.get(ref)).exists()) transaction.delete(ref);
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
  const text = content.trim();
  if (!text || text.length > 5000) {
    throw new Error('A observação precisa ter entre 1 e 5000 caracteres.');
  }
  await addDoc(notesCollection(profile.companyId, taskId), {
    authorUid: profile.uid,
    author: profile.name,
    role: profile.jobTitle,
    content: text,
    createdAt: serverTimestamp(),
  });
}

export function taskErrorMessage(error: unknown, fallback: string): string {
  const code = (error as { code?: string } | null)?.code;
  if (code === 'permission-denied') return 'Sem permissão para acessar estas tarefas no Firestore.';
  if (!code && error instanceof Error) return error.message;
  return fallback;
}
