import { DynamicForm } from '@/pages/DynamicForm';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/dynamic-form')({
  component: DynamicForm,
});
