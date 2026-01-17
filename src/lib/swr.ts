import { SWRConfiguration } from 'swr';
import { api } from './axios';

export const swrConfig: SWRConfiguration = {
  fetcher: (url: string) => api.get(url).then((res) => res.data),
  revalidateOnFocus: false,
  shouldRetryOnError: false,
  dedupingInterval: 5000,
};
