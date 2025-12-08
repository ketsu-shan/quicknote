# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Development Commands

- `npm install` - Install dependencies
- `npm run dev` - Start development server on port 3000
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Environment Setup

Set `GEMINI_API_KEY` in `.env.local` for API access. The key is exposed to the frontend via `process.env.API_KEY` and `process.env.GEMINI_API_KEY`.

## Architecture Overview

GlassNote is a React-based sticky note/task management widget with a glassmorphism design. It's built as a web preview that can be packaged into Electron or Tauri for native desktop use.

### Key Components

- **StickyNote** (`components/StickyNote.tsx`): Main container component that manages all state. Handles task CRUD operations, filtering (active/completed), search, drag-and-drop reordering, and collapsible mini mode. Tasks persist to localStorage under key `glassnote-tasks`.

- **TaskItem** (`components/TaskItem.tsx`): Individual task with optimistic UI updates for completion animations. Features particle burst effects and strikethrough animation on completion. Uses a 700ms animation delay before triggering actual state change.

- **Icons** (`components/Icons.tsx`): SVG icon components used throughout the app.

### State Management

All state lives in StickyNote component using React hooks. No external state library. Key state:
- `tasks`: Array of Task objects (id, text, completed, createdAt)
- `filter`: FilterType enum (ALL, ACTIVE, COMPLETED)
- Drag-and-drop only works in ACTIVE view without search query

### Styling

Uses Tailwind CSS loaded via CDN. Custom animations defined in `index.html`:
- `animate-jelly`: Checkbox bounce effect
- `animate-particle`: Particle burst on completion
- `.strike-line`: Animated strikethrough for completed tasks

### Path Alias

`@/*` maps to project root (e.g., `@/components/...`).
