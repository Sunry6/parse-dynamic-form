import { useState, useCallback } from 'react';
import { api } from '@/lib/axios';
import { AxiosError } from 'axios';

interface MutationState<T> {
  data: T | null;
  error: AxiosError | null;
  isLoading: boolean;
}

interface MutationOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: AxiosError) => void;
}

export function useMutation<T, D = unknown>(
  url: string,
  method: 'post' | 'put' | 'patch' | 'delete' = 'post',
  options?: MutationOptions<T>
) {
  const [state, setState] = useState<MutationState<T>>({
    data: null,
    error: null,
    isLoading: false,
  });

  const mutate = useCallback(
    async (data?: D) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const response = await api[method]<T>(url, data);
        setState({ data: response.data, error: null, isLoading: false });
        options?.onSuccess?.(response.data);
        return response.data;
      } catch (error) {
        const axiosError = error as AxiosError;
        setState({ data: null, error: axiosError, isLoading: false });
        options?.onError?.(axiosError);
        throw error;
      }
    },
    [url, method, options]
  );

  return { ...state, mutate };
}
