import { MOCK_TASKS, type Task } from '@/constants/tasks';
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

type TasksContextValue = { tasks: Task[]; completeTask: (id: string) => void};

const TasksContext = createContext<TasksContextValue | null>(null);

export function TasksProvider({ children }: {children: ReactNode }) {
    const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);

    const completeTask = (id: string) =>
        setTasks((prev) =>
        prev.map((t) =>
            t.id === id && !t.completedAt ? {...t, completedAt: new Date().toISOString() } : t
            )
        );
    
    const value = useMemo(() => ({ tasks, completeTask }), [tasks]);
    return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
}


export function useTasks() {
    const ctx = useContext(TasksContext);
    if (!ctx) throw new Error('useTasks deve ser usado dentro de <TaskProvider>');
    return ctx;
}