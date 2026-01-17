import { swrConfig } from '@/lib/swr';
import { router } from '@/router';
import { RouterProvider } from '@tanstack/react-router';
import { SWRConfig } from 'swr';

export function App() {
  return (
    <SWRConfig value={swrConfig}>
      <RouterProvider router={router} />
    </SWRConfig>
  );
}
