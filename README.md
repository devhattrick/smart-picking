# Smart Picking System

Web application for warehouse picking/inventory flow management with role-based access (`admin`, `employee`).

## Web App

- Production URL: https://devhattrick.github.io/smart-picking/login

## Tech Stack

- React 19 + TypeScript
- Vite 7
- React Router
- Tailwind CSS
- Recharts
- XLSX (Excel export)

## How to Setup and Run

### 1. Prerequisites

- Node.js `20.19+` (recommended: latest LTS)
- npm `10+`

### 2. Install dependencies

```bash
npm install
```

### 3. Run in development

```bash
npm run dev
```

Then open the local URL shown in terminal (usually `http://localhost:5173`).

### 4. Build for production

```bash
npm run build
```

### 5. Preview production build

```bash
npm run preview
```

## Available Scripts

- `npm run dev` - start dev server
- `npm run build` - build app to `dist/`
- `npm run preview` - preview production build
- `npm run typecheck` - run TypeScript check
- `npm run lint` - run ESLint

## Demo Accounts

- Admin: `admin / password`
- Employee: `emp / password`
