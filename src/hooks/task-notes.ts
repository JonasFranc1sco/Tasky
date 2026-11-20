import type { TaskNote } from '@/constants/tasks';
import { useAuth } from '@/hooks/auth-context';
import { TaskService } from '@/services/task-service';
import { useCallback, useEffect, useState } from 'react';

export function useTaskNotes(taskId: string | null) {
  const { profile } = useAuth();
  const subscriptionKey =
    taskId && profile?.companyId && profile.uid
      ? `${profile.uid}:${profile.companyId}:${taskId}`
      : null;
  const [snapshot, setSnapshot] = useState<{
    key: string | null;
    notes: TaskNote[];
    loading: boolean;
    error: string | null;
  }>({ key: null, notes: [], loading: false, error: null });

  useEffect(() => {
    if (!taskId || !profile?.companyId || !profile.uid || !subscriptionKey) {
      setSnapshot({ key: null, notes: [], loading: false, error: null });
      return;
    }

    setSnapshot({ key: subscriptionKey, notes: [], loading: true, error: null });
    return TaskService.subscribeToTaskNotes(
      profile.companyId,
      taskId,
      (nextNotes) => {
        setSnapshot({ key: subscriptionKey, notes: nextNotes, loading: false, error: null });
      },
      (subscriptionError) => {
        setSnapshot({
          key: subscriptionKey,
          notes: [],
          loading: false,
          error:
            subscriptionError.message || 'Não foi possível carregar as mensagens.',
        });
      }
    );
  }, [profile?.companyId, profile?.uid, subscriptionKey, taskId]);

  const addNote = useCallback(
    async (content: string) => {
      if (!taskId || !profile?.companyId || !profile.uid) {
        throw new Error('Não foi possível identificar a tarefa ou o usuário.');
      }
      await TaskService.addTaskNote(profile.companyId, taskId, {
        author: profile.name,
        authorUid: profile.uid,
        role: profile.jobTitle,
        content,
      });
    },
    [profile, taskId]
  );

  const currentSnapshot =
    snapshot.key === subscriptionKey
      ? snapshot
      : { notes: [], loading: !!subscriptionKey, error: null };

  return { ...currentSnapshot, addNote };
}
