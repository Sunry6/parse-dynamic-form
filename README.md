# Create React Scaffold

A modern, AI-powered React scaffold CLI with TypeScript, Rspack, and best-in-class libraries.

## Quick Start

```bash
# Using npx (recommended)
npx create-react-scaffold my-app

# Or install globally
pnpm add -g create-react-scaffold
create-react-scaffold my-app
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
│   ├── ui/           # Reusable UI components (shadcn pattern)
│   ├── forms/        # Form components
│   ├── grid/         # AG Grid components
│   ├── flow/         # React Flow components
│   └── layout/       # Layout components
├── hooks/            # Custom React hooks
├── lib/              # Utilities and configurations
├── pages/            # Page components
├── services/         # API service functions
└── types/            # TypeScript type definitions
```

## Libraries Included

| Library         | Purpose           |
| --------------- | ----------------- |
| React 18        | UI Framework      |
| TypeScript      | Type Safety       |
| Rspack          | Build Tool        |
| TanStack Router | Type-safe Routing |
| Tailwind CSS    | Styling           |
| SCSS            | CSS Preprocessor  |
| shadcn/ui       | UI Components     |
| SWR             | Data Fetching     |
| Axios           | HTTP Client       |
| react-hook-form | Form Management   |
| Zod             | Schema Validation |
| AG Grid         | Data Tables       |
| React Flow      | Flow Diagrams     |
| Lucide React    | Icons             |

## GitHub Copilot Integration

This project includes a `.github/copilot-instructions.md` file that provides context and best practices for GitHub Copilot. This ensures consistent, high-quality code suggestions that follow the project's conventions.

## Publishing to npm

```bash
# Login to npm
npm login

# Publish the package
npm publish
```

After publishing, users can create new projects with:

```bash
npx create-react-scaffold my-app
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT
