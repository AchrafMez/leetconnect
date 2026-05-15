# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

# Marketplace Frontend

## Overview
The frontend of the Marketplace service is a React-based application built with Vite. It provides a user-friendly interface for interacting with the marketplace backend.

## Key Features
- Responsive design with Tailwind CSS.
- Component-based architecture for reusability.
- State management using React Context.
- Integration with the backend API for dynamic data.

## Project Structure
```
frontend/
├── public/                # Static assets
├── src/
│   ├── components/        # Reusable UI components
│   ├── context/           # State management
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility functions
│   ├── pages/             # Page components
│   ├── assets/            # Static assets
│   └── ...
├── Dockerfile             # Docker configuration
├── package.json           # Dependencies and scripts
├── vite.config.ts         # Vite configuration
└── tsconfig.json          # TypeScript configuration
```

## Getting Started
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open the application in your browser at `http://localhost:3000`.

## Environment Variables
Ensure the following environment variables are set:
- `VITE_API_URL`: URL of the backend API.
