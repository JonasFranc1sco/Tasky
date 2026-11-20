import { MOCK_TASKS, type Task, type TaskNote } from '@/constants/tasks';
import {
  createContext,
  useCallback,
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
  completedPercentage: string;
};

type NewTask = Omit<Task, 'id' | 'createdAt' | 'completedAt' | 'notes'>;

type TasksContextValue = {
  tasks: Task[];
  metrics: TaskMetrics;
  addTask: (task: NewTask) => void;
  addTaskNote: (taskId: string, note: TaskNote) => void;
  completeTask: (id: string) => void;
  updateTaskStatus: (id: string, status: TaskStatus) => void;
};

const INITIAL_TASKS: Task[] = [
  ...MOCK_TASKS,
  {
    id: 'm2',
    name: 'Configuração do Runner CI/CD',
    description:
      'Instalar o novo runner, definir tags de execução e revisar os workflows de deploy.',
    dueDate: 'Hoje, 11:30',
    assignee: { name: 'Eduarda Najara' },
    priority: 'media',
    category: 'Rotina',
    createdAt: '2026-10-16T12:30:00.000Z',
    completedAt: '2026-10-18T18:42:00.000Z',
    notes: [
      {
        id: 'm2-note-1',
        author: 'João Pedro',
        role: 'Supervisor',
        timestamp: '18/10/2026, 12:42',
        content:
          'Confirmar a versão do runner e o cache de dependências antes de encerrar a configuração.',
      },
    ],
  },
  {
    id: 'm3',
    name: 'Auditoria de Cobertura de Testes',
    description:
      'Levantar a cobertura dos módulos críticos e gerar relatório para o Sprint.',
    dueDate: 'Amanhã, 18:00',
    assignee: { name: 'Kemily Freitas' },
    priority: 'media',
    category: 'Rotina',
    createdAt: '2026-10-16T12:30:00.000Z',
    completedAt: null,
  },
];

const TasksContext = createContext<TasksContextValue | null>(null);

export function TasksProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(() =>
    INITIAL_TASKS.map((task) => ({ ...task, notes: task.notes ?? [] }))
  );

  const updateTaskStatus = useCallback((id: string, status: TaskStatus) => {
    setTasks((current) =>
      current.map((task) =>
        task.id === id
          ? {
              ...task,
              completedAt:
                status === 'completed'
                  ? task.completedAt ?? new Date().toISOString()
                  : null,
            }
          : task
      )
    );
  }, []);

  const completeTask = useCallback(
    (id: string) => updateTaskStatus(id, 'completed'),
    [updateTaskStatus]
  );

  const addTask = useCallback((task: NewTask) => {
    setTasks((current) => [
      {
        ...task,
        id: `task-${Date.now()}`,
        createdAt: new Date().toISOString(),
        completedAt: null,
        notes: [],
      },
      ...current,
    ]);
  }, []);

  const addTaskNote = useCallback((taskId: string, note: TaskNote) => {
    setTasks((current) =>
      current.map((task) =>
        task.id === taskId
          ? { ...task, notes: [...(task.notes ?? []), note] }
          : task
      )
    );
  }, []);

  const metrics = useMemo<TaskMetrics>(() => {
    const completed = tasks.filter((task) => task.completedAt).length;
    const total = tasks.length;
    return {
      total,
      pending: total - completed,
      completed,
      completedPercentage: `${
        total === 0 ? 0 : Math.round((completed / total) * 100)
      }% concluído`,
    };
  }, [tasks]);

  const value = useMemo(
    () => ({ tasks, metrics, addTask, addTaskNote, completeTask, updateTaskStatus }),
    [tasks, metrics, addTask, addTaskNote, completeTask, updateTaskStatus]
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
