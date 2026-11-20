import { useTasks } from '@/hooks/tasks-context';
import { taskErrorMessage } from '@/services/task-service';
import { useRef, useState } from 'react';

export function useTaskCompletion() {
  const { completeTask } = useTasks();
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [completionError, setCompletionError] = useState<string | null>(null);
  const busy = useRef(false);

  async function complete(id: string) {
    if (busy.current) return false;
    busy.current = true;
    setCompletingId(id);
    setCompletionError(null);
    try {
      await completeTask(id);
      return true;
    } catch (cause) {
      setCompletionError(taskErrorMessage(cause, 'Não foi possível concluir a tarefa.'));
      return false;
    } finally {
      busy.current = false;
      setCompletingId(null);
    }
  }

  return { complete, completingId, completionError, clearCompletionError: () => setCompletionError(null) };
}
