import type { Task } from '@/constants/tasks';
import { useAuth } from '@/hooks/auth-context';
import { TaskService } from '@/services/task-service';
import {
  createContext,
  useCallback,
  useEffect,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type TaskStatus = 'pending' | 'completed';

export type TaskMetrics = {
  total: number;
  pending: number;
  completed: number;
  archived: number;
  completedPercentage: string;
};

type NewTask = Omit<Task, 'id' | 'createdAt' | 'completedAt'>;

type TasksContextValue = {
  tasks: Task[];
  metrics: TaskMetrics;
  loading: boolean;
  error: string | null;
  addTask: (task: NewTask) => Promise<void>;
  completeTask: (id: string) => Promise<void>;
  updateTaskStatus: (id: string, status: TaskStatus) => Promise<void>;
  archiveTask: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
};

const TasksContext = createContext<TasksContextValue | null>(null);

export function TasksProvider({ children }: { children: ReactNode }) {
  const { profile, loading: authLoading } = useAuth();
  const scopeKey =
    profile?.uid && profile.companyId
      ? `${profile.uid}:${profile.companyId}:${profile.role}`
      : null;
  const [snapshot, setSnapshot] = useState<{
    scope: string | null;
    tasks: Task[];
    loading: boolean;
    error: string | null;
  }>({ scope: null, tasks: [], loading: true, error: null });
  const currentSnapshot =
    snapshot.scope === scopeKey
      ? snapshot
      : {
          tasks: [],
          loading: authLoading || !!scopeKey,
          error: null,
        };
  const visibleTasks = currentSnapshot.tasks;

  useEffect(() => {
    if (authLoading) return;
    if (!profile?.companyId || !profile.uid || !scopeKey) {
      setSnapshot({ scope: null, tasks: [], loading: false, error: null });
      return;
    }

    const subscriptionScope = scopeKey;
    setSnapshot({
      scope: subscriptionScope,
      tasks: [],
      loading: true,
      error: null,
    });
    return TaskService.subscribeToCompanyTasks(
      profile.companyId,
      profile.uid,
      profile.role === 'admin',
      (nextTasks) => {
        setSnapshot({
          scope: subscriptionScope,
          tasks: nextTasks,
          loading: false,
          error: null,
        });
      },
      (subscriptionError) => {
        setSnapshot({
          scope: subscriptionScope,
          tasks: [],
          loading: false,
          error:
            subscriptionError.message || 'Não foi possível sincronizar as tarefas.',
        });
      }
    );
  }, [authLoading, profile?.companyId, profile?.role, profile?.uid, scopeKey]);

  const updateTaskStatus = useCallback(
    async (id: string, status: TaskStatus) => {
      if (!profile?.companyId || !profile.uid) {
        throw new Error('Entre na sua conta para atualizar esta tarefa.');
      }
      const task = visibleTasks.find((item) => item.id === id);
      if (!task) throw new Error('Tarefa não encontrada.');
      if (
        profile.role !== 'admin' &&
        (status !== 'completed' || task.assignee.uid !== profile.uid)
      ) {
        throw new Error('Você não tem permissão para atualizar esta tarefa.');
      }
      await TaskService.updateTaskStatus(
        profile.companyId,
        id,
        status,
        profile.role === 'admin' && status === 'pending' && !!task.archivedAt
      );
    },
    [profile, visibleTasks]
  );

  const archiveTask = useCallback(
    async (id: string) => {
      if (profile?.role !== 'admin' || !profile.companyId) {
        throw new Error('Apenas gestores podem validar e arquivar tarefas.');
      }
      const task = visibleTasks.find((item) => item.id === id);
      if (!task) throw new Error('Tarefa não encontrada.');
      if (!task.completedAt) {
        throw new Error('A tarefa precisa ser concluída antes de ser arquivada.');
      }
      if (task.archivedAt) return;
      await TaskService.archiveTask(profile.companyId, id);
    },
    [profile, visibleTasks]
  );

  const deleteTask = useCallback(
    async (id: string) => {
      if (profile?.role !== 'admin' || !profile.companyId) {
        throw new Error('Apenas gestores podem excluir tarefas.');
      }
      if (!visibleTasks.some((task) => task.id === id)) {
        throw new Error('Tarefa não encontrada.');
      }
      await TaskService.deleteTask(profile.companyId, id);
    },
    [profile, visibleTasks]
  );

  const completeTask = useCallback(
    (id: string) => updateTaskStatus(id, 'completed'),
    [updateTaskStatus]
  );

  const addTask = useCallback(
    async (task: NewTask) => {
      if (profile?.role !== 'admin' || !profile.companyId || !profile.uid) {
        throw new Error('Apenas gestores podem delegar tarefas.');
      }
      await TaskService.createTask(profile.companyId, profile.uid, task);
    },
    [profile]
  );

  const metrics = useMemo<TaskMetrics>(() => {
    const completed = visibleTasks.filter((task) => task.completedAt).length;
    const archived = visibleTasks.filter((task) => task.archivedAt).length;
    const total = visibleTasks.length;
    return {
      total,
      pending: total - completed,
      completed,
      archived,
      completedPercentage: `${
        total === 0 ? 0 : Math.round((completed / total) * 100)
      }% concluído`,
    };
  }, [visibleTasks]);

  const value = useMemo(
    () => ({
      tasks: visibleTasks,
      metrics,
      loading: currentSnapshot.loading,
      error: currentSnapshot.error,
      addTask,
      completeTask,
      updateTaskStatus,
      archiveTask,
      deleteTask,
    }),
    [visibleTasks, metrics, currentSnapshot, addTask, completeTask, updateTaskStatus, archiveTask, deleteTask]
  );

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
}

export function useTasks() {
  const context = useContext(TasksContext);
  if (!context) {
    throw new Error('useTasks deve ser usado dentro de <TasksProvider>');
  }
  return context;
}
