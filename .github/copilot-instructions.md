# GitHub Copilot Instructions for React Development

## Project Overview

This is a modern React application built with TypeScript, using Rspack as the bundler and following best practices for frontend development.

## Tech Stack

- **Framework**: React 18 with TypeScript
- **Bundler**: Rspack (fast Rust-based bundler)
- **Router**: TanStack Router for type-safe routing
- **Styling**: Tailwind CSS with shadcn/ui components, SCSS support
- **State Management**: SWR for server state, React hooks for local state
- **Forms**: react-hook-form with Zod validation
- **HTTP Client**: Axios with interceptors
- **Data Grid**: AG Grid for complex data tables
- **Flow Editor**: React Flow for node-based editors

## Coding Standards

### TypeScript

- Always use strict TypeScript with proper type annotations
- Prefer `interface` over `type` for object shapes
- Use `type` for unions, intersections, and utility types
- Export types from a central `types/` directory
- Use generic types for reusable components

### React Components

- Use functional components with hooks exclusively
- Follow the naming convention: `PascalCase` for components
- Place components in appropriate directories:
  - `components/ui/` - Reusable UI primitives (shadcn pattern)
  - `components/forms/` - Form-related components
  - `components/grid/` - Data grid components
  - `components/flow/` - React Flow components
  - `components/layout/` - Layout components
- Use `forwardRef` for components that need ref forwarding
- Implement proper prop typing with `interface`

### Hooks

- Custom hooks should start with `use` prefix
- Place hooks in `hooks/` directory
- Return objects for multiple values, not arrays (except for useState pattern)
- Handle loading and error states properly

### State Management

- Use SWR for server state management
- Use `useState` for simple local state
- Use `useReducer` for complex local state
- Avoid prop drilling - use context when needed

### Forms

- Always use react-hook-form for forms
- Validate with Zod schemas
- Use `@hookform/resolvers` for integration
- Display validation errors inline

### Styling

- Use Tailwind CSS classes
- Use `cn()` utility for conditional classes
- Follow shadcn/ui patterns for component variants
- Use CSS variables for theming

### API Calls

- Use the configured Axios instance from `lib/axios`
- Use SWR hooks for data fetching
- Use mutation hooks for data modifications
- Handle errors gracefully with user feedback

### File Organization

```
src/
├── components/
│   ├── ui/           # Reusable UI components
│   ├── forms/        # Form components
│   ├── grid/         # Data grid components
│   ├── flow/         # Flow editor components
│   └── layout/       # Layout components
├── hooks/            # Custom React hooks
├── lib/              # Utilities and configurations
├── pages/            # Page components
├── services/         # API service functions
└── types/            # TypeScript type definitions
```

### Best Practices

1. **Performance**
   - Use `useMemo` and `useCallback` for expensive computations
   - Implement proper key props in lists
   - Lazy load routes and heavy components

2. **Accessibility**
   - Use semantic HTML elements
   - Include proper ARIA attributes
   - Ensure keyboard navigation works

3. **Error Handling**
   - Use error boundaries for component errors
   - Handle API errors with proper user feedback
   - Log errors appropriately

4. **Testing**
   - Write unit tests for utilities and hooks
   - Write integration tests for complex components
   - Use React Testing Library

## Code Examples

### Creating a new component

```tsx
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface MyComponentProps {
  className?: string;
  children: React.ReactNode;
}

export const MyComponent = forwardRef<HTMLDivElement, MyComponentProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('base-styles', className)} {...props}>
        {children}
      </div>
    );
  }
);
MyComponent.displayName = 'MyComponent';
```

### Creating a custom hook

```tsx
import { useState, useCallback } from 'react';

export function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => setValue((v) => !v), []);
  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);

  return { value, toggle, setTrue, setFalse };
}
```

### Creating a form with validation

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1, 'Required'),
  email: z.string().email('Invalid email'),
});

type FormData = z.infer<typeof schema>;

export function MyForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  return <form onSubmit={handleSubmit((data) => console.log(data))}>{/* form fields */}</form>;
}
```

### Fetching data with SWR

```tsx
import { useFetch } from '@/hooks/useFetch';

interface User {
  id: string;
  name: string;
}

export function UserList() {
  const { data, error, isLoading } = useFetch<User[]>('/users');

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading users</div>;

  return (
    <ul>
      {data?.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```
