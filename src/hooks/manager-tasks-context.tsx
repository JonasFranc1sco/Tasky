import type { ManagerTask } from '@/components/manager-task-card';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

type ManagerTaskDraft = Omit<ManagerTask, 'id' | 'createdAt' | 'completedAt'>;

type ManagerTaskMetrics = {
  total: number;
  pending: number;
  completed: number;
  completedPercentage: string;
};

type ManagerTasksContextValue = {
  tasks: ManagerTask[];
  metrics: ManagerTaskMetrics;
  addTask: (task: ManagerTaskDraft) => void;
  updateTaskStatus: (id: string, status: ManagerTask['status']) => void;
};

const INITIAL_MANAGER_TASKS: ManagerTask[] = [
  {
    id: '1',
    title: 'Code Review do PR #482',
    description:
      'Revisar os arquivos alterados, validar a cobertura de testes e aprovar ou solicitar correções.',
    assignee: 'Rafael Horeay',
    time: 'Hoje, 17:00',
    status: 'pending',
    category: 'Alta Prioridade',
    createdAt: '2026-10-16T12:30:00.000Z',
  },
  {
    id: '2',
    title: 'Configuração do Runner CI/CD',
    description:
      'Instalar o novo runner, definir tags de execução e revisar os workflows de deploy.',
    assignee: 'Eduarda Najara',
    time: 'Hoje, 11:30',
    status: 'completed',
    createdAt: '2026-10-16T12:30:00.000Z',
    completedAt: '2026-10-18T18:42:00.000Z',
  },
  {
    id: '3',
    title: 'Auditoria de Cobertura de Testes',
    description:
      'Levantar a cobertura dos módulos críticos e gerar relatório para o Sprint.',
    assignee: 'Kemily Freitas',
    time: 'Amanhã, 18:00',
    status: 'pending',
    category: 'Rotina',
    createdAt: '2026-10-16T12:30:00.000Z',
  },
];

const ManagerTasksContext = createContext<ManagerTasksContextValue | null>(null);

export function ManagerTasksProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<ManagerTask[]>(INITIAL_MANAGER_TASKS);

  const addTask = useCallback((task: ManagerTaskDraft) => {
    setTasks((current) => [
      {
        ...task,
        id: `task-${Date.now()}`,
        createdAt: new Date().toISOString(),
      },
      ...current,
    ]);
  }, []);

  const updateTaskStatus = useCallback(
    (id: string, status: ManagerTask['status']) => {
      setTasks((current) =>
        current.map((task) =>
          task.id === id
            ? {
                ...task,
                status,
                completedAt:
                  status === 'completed'
                    ? task.completedAt ?? new Date().toISOString()
                    : undefined,
              }
            : task
        )
      );
    },
    []
  );

  const metrics = useMemo<ManagerTaskMetrics>(() => {
    const completed = tasks.filter((task) => task.status === 'completed').length;
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
    () => ({ tasks, metrics, addTask, updateTaskStatus }),
    [tasks, metrics, addTask, updateTaskStatus]
  );

  return (
    <ManagerTasksContext.Provider value={value}>
      {children}
    </ManagerTasksContext.Provider>
  );
}

export function useManagerTasks() {
  const context = useContext(ManagerTasksContext);
  if (!context) {
    throw new Error(
      'useManagerTasks deve ser usado dentro de <ManagerTasksProvider>'
    );
  }
  return context;
}
