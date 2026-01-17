import useSWR, { SWRConfiguration } from 'swr';
import { api } from '@/lib/axios';

export function useFetch<T>(url: string | null, config?: SWRConfiguration) {
  return useSWR<T>(
    url,
    async (url: string) => {
      const response = await api.get<T>(url);
      return response.data;
    },
    config
  );
}
