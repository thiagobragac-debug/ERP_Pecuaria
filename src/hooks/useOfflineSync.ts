import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dataService } from '../services/dataService';

export const useOfflineQuery = <T>(key: string[], table: string) => {
  return useQuery({
    queryKey: key,
    queryFn: () => dataService.getItems<T>(table),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useOfflineMutation = <T extends { id: string }>(
  table: string, 
  queryKeysToInvalidate: string[][], 
  action: 'save' | 'delete' = 'save'
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: T) => (action === 'save' ? dataService.saveItem(table, data) : dataService.deleteItem(table, data.id)) as any,
    onMutate: async (newData: T) => {
      // Optimistic update
      for (const key of queryKeysToInvalidate) {
        await queryClient.cancelQueries({ queryKey: key });
        const previousData = queryClient.getQueryData(key);
        queryClient.setQueryData(key, (old: any) => {
          if (!old) return action === 'save' ? [newData] : [];
          
          if (action === 'delete') {
            return old.filter((item: any) => item.id !== newData.id);
          }

          const exists = old.find((item: any) => item.id === newData.id);
          if (exists) {
            return old.map((item: any) => item.id === newData.id ? newData : item);
          }
          return [...old, newData];
        });
      }
    },
    onSettled: () => {
      for (const key of queryKeysToInvalidate) {
        queryClient.invalidateQueries({ queryKey: key });
      }
    }
  });
};
