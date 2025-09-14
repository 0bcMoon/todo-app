# CRUSH.md

This file outlines the development conventions and commands for the `frontend` project.

## Build/Lint/Test Commands

- **Install Dependencies**: `npm install`
- **Development Server**: `npm run dev`
- **Build**: `npm run build`
- **Lint**: `npm run lint`
- **Type Check**: `tsc --noEmit` (implicitly run by `npm run build`)
- **Run Tests**: This project does not have a dedicated test script in `package.json`. You will need to add one if you intend to write tests. A common setup involves `vitest` for React projects.

## Code Style Guidelines

### General
- **Language**: TypeScript with React.
- **Formatting**: Handled by ESLint. Run `npm run lint` to check for formatting issues.
- **Naming Conventions**:
    - Files: `PascalCase.tsx` for components, `camelCase.ts` for hooks, utilities, and API files.
    - Components: `PascalCase`.
    - Functions/Variables: `camelCase`.
- **Imports**:
    - Relative imports are used.
    - Group imports: React/library imports first, then absolute imports, then relative imports.
- **Types**:
    - Explicit typing is preferred.
    - Interfaces and types are defined in `src/types/index.ts`.
- **Error Handling**: Use `try...catch` blocks for API calls and other potentially error-prone operations. Display user-friendly error messages.

### React Specific
- **Functional Components**: Prefer functional components with hooks.
- **Hooks**: Custom hooks should be placed in the `src/hooks` directory.
- **State Management**: React Query is used for server state management. For local UI state, use `useState` and `useReducer`.
- **Styling**: Tailwind CSS is used for styling.
