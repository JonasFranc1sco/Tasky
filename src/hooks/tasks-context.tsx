import { useAuth } from '@/hooks/auth-context';
import {
  addTaskNote,
  changeTaskStatus,
  createTask,
  deleteTask,
  subscribeToTaskNotes,
  subscribeToTasks,
  taskErrorMessage,
  type TaskAccess,
} from '@/services/task-service';
import type { EmployeeMember } from '@/types/company';
import type { NewTask, Task, TaskNote } from '@/types/task';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

type TaskMetrics = {
  total: number;
  pending: number;
  completed: number;
  archived: number;
  completedPercentage: string;
};

type TasksContextValue = {
  tasks: Task[];
  metrics: TaskMetrics;
  loading: boolean;
  error: string | null;
  delegateTask: (input: NewTask, assignee: EmployeeMember) => Promise<void>;
  completeTask: (id: string) => Promise<void>;
  archiveTask: (id: string) => Promise<void>;
  reopenTask: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  saveTaskNote: (id: string, content: string) => Promise<void>;
};

const TasksContext = createContext<TasksContextValue | null>(null);
const emptyTasks: Task[] = [];

export function TasksProvider({ children }: { children: ReactNode }) {
  const { user, profile, loading: authLoading } = useAuth();
  const member = !authLoading && user && profile?.uid === user.uid && profile.status === 'active'
    ? profile
    : null;
  const uid = member?.uid;
  const companyId = member?.companyId;
  const isAdmin = member?.role === 'admin';
  const scope = uid && companyId ? JSON.stringify([uid, companyId, isAdmin]) : null;
  const [snapshot, setSnapshot] = useState<{
    scope: string;
    tasks: Task[];
    error: string | null;
  } | null>(null);

  useEffect(() => {
    if (!uid || !companyId || !scope) return;
    return subscribeToTasks({ uid, companyId, isAdmin }, (items) => {
      setSnapshot({ scope, tasks: items, error: null });
    }, (cause) => {
      setSnapshot({
        scope,
        tasks: [],
        error: taskErrorMessage(cause, 'Não foi possível carregar as tarefas.'),
      });
    });
  }, [uid, companyId, isAdmin, scope]);

  const current = snapshot?.scope === scope ? snapshot : null;
  const tasks = current?.tasks ?? emptyTasks;
  const metrics = useMemo(() => {
    const counts = { pending: 0, completed: 0, archived: 0 };
    for (const task of tasks) counts[task.status]++;
    const total = tasks.length;
    const percentage = total ? Math.round((counts.completed + counts.archived) * 100 / total) : 0;
    return { ...counts, total, completedPercentage: `${percentage}% concluído` };
  }, [tasks]);

  function requireAccess(): TaskAccess {
    if (!uid || !companyId) throw new Error('Sua conta precisa estar ativa em uma empresa.');
    return { uid, companyId, isAdmin };
  }

  const value: TasksContextValue = {
    tasks,
    metrics,
    loading: authLoading || (Boolean(scope) && !current),
    error: current?.error ?? (authLoading || scope ? null : 'Sua conta precisa estar ativa em uma empresa.'),
    delegateTask: async (input, assignee) => createTask(requireAccess(), input, assignee),
    completeTask: async (id) => changeTaskStatus(requireAccess(), id, 'complete'),
    archiveTask: async (id) => changeTaskStatus(requireAccess(), id, 'archive'),
    reopenTask: async (id) => changeTaskStatus(requireAccess(), id, 'reopen'),
    deleteTask: async (id) => deleteTask(requireAccess(), id),
    saveTaskNote: async (id, content) => {
      if (!member || !isAdmin || !tasks.some((task) => task.id === id && !task.deleting)) {
        throw new Error('Somente gestores podem adicionar observações às tarefas da empresa.');
      }
      await addTaskNote(id, member, content);
    },
  };

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
}

export function useTasks() {
  const context = useContext(TasksContext);
  if (!context) throw new Error('useTasks deve ser usado dentro de <TasksProvider>.');
  return context;
}

export function useTaskNotes(task?: Pick<Task, 'id' | 'companyId' | 'assigneeUid' | 'deleting'>) {
  const { user, profile } = useAuth();
  const taskId = task?.id;
  const companyId = task?.companyId;
  const uid = user?.uid;
  const canRead = uid && profile?.uid === uid && profile.status === 'active' &&
    profile.companyId === companyId && (profile.role === 'admin' || task?.assigneeUid === uid);
  const scope = taskId && companyId && canRead && !task?.deleting
    ? JSON.stringify([uid, companyId, taskId])
    : null;
  const [snapshot, setSnapshot] = useState<{
    scope: string;
    notes: TaskNote[];
    error: string | null;
  } | null>(null);

  useEffect(() => {
    if (!taskId || !companyId || !scope) return;
    return subscribeToTaskNotes(companyId, taskId, (notes) => {
      setSnapshot({ scope, notes, error: null });
    }, (cause) => {
      setSnapshot({
        scope,
        notes: [],
        error: taskErrorMessage(cause, 'Não foi possível carregar as observações.'),
      });
    });
  }, [companyId, taskId, scope]);

  const current = snapshot?.scope === scope ? snapshot : null;
  return {
    notes: current?.notes ?? [],
    loading: Boolean(scope) && !current,
    error: current?.error ?? null,
  };
}
