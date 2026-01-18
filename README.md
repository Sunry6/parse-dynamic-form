# Dynamic Form System

A flexible, type-safe dynamic form rendering system for React applications. Designed for insurance underwriting scenarios with support for complex field dependencies, validation, and remote data loading.

## Features

- 🎯 **JSON Schema Driven** - Define forms declaratively with type-safe schemas
- 🔗 **Field Dependencies** - Advanced field linking (联动) with show/hide/disable/setValue effects
- ✅ **Dynamic Validation** - Zod-based validation with conditional rules
- 📡 **Remote Options** - Load select options from sessionStorage or APIs with cascading support
- 🎨 **Component Agnostic** - Component Registry pattern for UI library independence
- 🏢 **Enterprise Ready** - Array fields, nested structures, and custom field types
- 📱 **Responsive Layout** - Grid-based layout with configurable spans

## Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

## Features

- ⚡ **Rspack** - Blazing fast Rust-based bundler
- 🎨 **Tailwind CSS** - Utility-first CSS framework
- 🧩 **shadcn/ui** - Beautiful, accessible components
- 📝 **TypeScript** - Type-safe development
- 🔄 **SWR** - React Hooks for data fetching
- 📋 **react-hook-form** - Performant forms with Zod validation
- 📊 **AG Grid** - Enterprise-grade data grid
- 🔀 **React Flow** - Node-based flow editor
- 🤖 **GitHub Copilot** - AI-assisted development with best practices

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 9+

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Fix ESLint errors
- `pnpm format` - Format code with Prettier
- `pnpm type-check` - Run TypeScript type checking

## Project Structure

```text
src/
├── components/
│   ├── ui/                      # shadcn/ui components
│   ├── forms/
│   │   ├── DynamicForm.tsx      # Main form component
│   │   ├── DynamicField.tsx     # Individual field renderer
│   │   ├── renderers/           # Field type renderers
│   │   └── adapters/            # UI component adapters
│   ├── grid/                    # AG Grid components
│   ├── flow/                    # React Flow components
│   └── layout/                  # Layout components
├── hooks/
│   ├── useFetch.ts              # Data fetching hook
│   ├── useMutation.ts           # Data mutation hook
│   ├── useToggle.ts             # Toggle state hook
│   └── useFieldOptions.ts       # Remote options loader
├── lib/
│   ├── schemaParser.ts          # Schema to Zod converter
│   ├── dependencyResolver.ts    # Field dependency engine
│   └── componentRegistry.ts     # Component registry pattern
├── pages/
│   ├── DynamicForm.tsx          # Demo page
│   └── Home.tsx
├── types/
│   └── dynamic-form.ts          # Form schema types
└── docs/
    └── DYNAMIC_FORM_GUIDE.md    # Complete usage guide
```

## Core Dependencies

| Library         | Purpose               |
| --------------- | --------------------- |
| React 18        | UI Framework          |
| TypeScript      | Type Safety           |
| react-hook-form | Form State Management |
| Zod             | Schema Validation     |
| Rspack          | Fast Build Tool       |
| Tailwind CSS    | Styling Framework     |
| shadcn/ui       | UI Component Library  |
| TanStack Router | Type-safe Routing     |

## Usage Example

```tsx
import { DynamicForm } from '@/components/forms/DynamicForm';
import type { FormSchema } from '@/types/dynamic-form';

const schema: FormSchema = {
  fields: [
    {
      name: 'applicantName',
      type: 'text',
      label: '申请人姓名',
      validation: { required: true },
    },
    {
      name: 'occupation',
      type: 'select',
      label: '职业',
      optionsKey: 'occupations', // Load from sessionStorage.listMap
    },
    {
      name: 'riskLevel',
      type: 'text',
      label: '风险等级',
      dependencies: [
        {
          field: 'occupation',
          condition: { in: ['pilot', 'miner'] },
          effect: 'setValue',
          value: '高风险',
        },
      ],
    },
  ],
};

function MyForm() {
  const handleSubmit = (data) => {
    console.log('Form data:', data);
  };

  return <DynamicForm schema={schema} onSubmit={handleSubmit} />;
}
```

For detailed documentation, see [DYNAMIC_FORM_GUIDE.md](src/docs/DYNAMIC_FORM_GUIDE.md).

## Key Features Explained

### Field Dependencies (联动)

Support for complex field interactions:

- **show/hide** - Conditionally display fields
- **enable/disable** - Control field interactivity
- **setValue** - Auto-populate based on other fields
- **validation** - Dynamic validation rules

### Remote Options Loading

Load select/radio options from:

- `sessionStorage.listMap` - For data dictionaries
- Remote APIs - With caching support
- Cascading lists - Province/city hierarchies

### Component Registry

Abstract UI component layer for flexibility:

```tsx
// Easily swap out UI libraries
registerComponent('Input', CustomInput);
registerComponent('Select', AntdSelect);
```

## GitHub Copilot Integration

This project includes comprehensive Copilot instructions:

- `.github/copilot-instructions.md` - Project-specific guidelines
- `.github/react-best-practices.md` - Performance optimization rules
- `.github/web-interface-guidelines.md` - Accessibility and UX standards

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT
