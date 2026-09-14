# React To-Do

A clean, fast to-do app built with **React** and **Vite**. All your tasks are
saved in the browser (localStorage) — no account, no backend, no setup.

## Features

- ✅ **Add / complete / delete** tasks
- ✏️ **Inline editing** — double-click a task to rename it (Enter to save, Escape to cancel)
- 🏷️ **Tags** — label tasks (e.g. `work`, `home`) and filter by tag
- 📅 **Due dates** — set a date per task; overdue tasks are highlighted in red
- ↕️ **Drag to reorder** — grab the handle and rearrange your list
- 🔃 **Sort by due date** — one click to order tasks by deadline
- 🔍 **Filters** — view All / Active / Done
- 💾 **Auto-save** — everything persists across refreshes via localStorage
- 🌗 **Light & dark** — follows your system theme

## Getting started

```bash
npm install      # install dependencies
npm run dev      # start the dev server (http://localhost:5173)
```

## Build for production

```bash
npm run build    # outputs to dist/
npm run preview  # preview the production build locally
```

## Tech

- [React 18](https://react.dev/)
- [Vite 5](https://vitejs.dev/)
- Plain CSS, no UI framework

## Usage notes

- **Drag-to-reorder** is available when viewing **All** tasks with no tag filter
  and manual sort active (so the order you drag maps directly to the saved order).
- Double-click any task title to edit it in place.
