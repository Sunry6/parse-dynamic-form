import UniversalFormExample from '@/pages/UniversalFormExample';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/universal-form')({
  component: UniversalFormExample,
});
