import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Task } from '@/types/task';
import { toast } from 'sonner';

export function useAIPrioritization() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingTaskIds, setProcessingTaskIds] = useState<string[]>([]);

  const prioritizeTasks = async (tasks: Task[]): Promise<Record<string, number> | null> => {
    if (tasks.length === 0) return null;

    setIsProcessing(true);
    setProcessingTaskIds(tasks.map(t => t.id));

    try {
      const { data, error } = await supabase.functions.invoke('ai-prioritize', {
        body: { 
          tasks: tasks.map(t => ({
            id: t.id,
            title: t.title,
            description: t.description,
            deadline: t.deadline,
            estimated_minutes: t.estimated_minutes,
            category: t.category,
            status: t.status,
            created_at: t.created_at,
          })),
          type: 'prioritize'
        }
      });

      if (error) throw error;
      
      if (data?.result) {
        toast.success('Tasks prioritized by AI!');
        return data.result as Record<string, number>;
      }
      
      return null;
    } catch (error) {
      console.error('Error prioritizing tasks:', error);
      toast.error('Failed to prioritize tasks');
      return null;
    } finally {
      setIsProcessing(false);
      setProcessingTaskIds([]);
    }
  };

  const suggestTasks = async (tasks: Task[]): Promise<Array<{title: string; priority: string; category: string}> | null> => {
    setIsProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-prioritize', {
        body: { 
          tasks: tasks.map(t => ({
            id: t.id,
            title: t.title,
            category: t.category,
            status: t.status,
          })),
          type: 'suggest'
        }
      });

      if (error) throw error;
      
      if (data?.result) {
        return data.result as Array<{title: string; priority: string; category: string}>;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting suggestions:', error);
      toast.error('Failed to get task suggestions');
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    processingTaskIds,
    prioritizeTasks,
    suggestTasks,
  };
}
