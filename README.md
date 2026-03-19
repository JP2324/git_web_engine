# Git Visual Emulator

An interactive, browser-based Git learning platform where developers learn Git by doing — not reading. Every command you type updates a live commit graph in real time.

**Live at:** 

---

## What It Is

Most Git tools either show you a static diagram or ask you to memorize commands. This project does neither. You get a real terminal, a live React Flow commit graph, and a structured exercise system that reacts to every command you run.

The Git engine runs entirely in the browser — no backend, no server, no database. Every branch, commit, merge, rebase, and reset is simulated in memory using a custom-built engine.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, fully client-side) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Graph Rendering | React Flow (`@xyflow/react`) |
| UI Primitives | Radix UI (Dialog, Select) |
| Icons | Lucide React |

---

## Features

**10 Structured Exercises** — a curated learning path from `git init` to a full capstone workflow:

1. Initialize and First Commit
2. Multiple Commits
3. Branch Creation
4. Switching Branches
5. Fast-Forward Merge
6. Three-Way Merge
7. Undoing with Reset
8. Safe Undo with Revert
9. Rebase
10. Full Workflow (capstone)

**Interactive Terminal** — a fully functional in-browser terminal with command history (up/down arrow), prompt path tracking, and realistic Git error messages.

**Live Commit Graph** — built on React Flow, the graph updates on every command. Branches, merge commits, rebases, and resets all render correctly with proper parent-chain traversal.

**Playground** — a free-form sandbox with no steps or restrictions, a session history log, repository state panel, and a quick reference cheatsheet.

**Docs Page** — a visual Git reference for 14 core commands, each with Before/After graph visualizations.

---

## Supported Commands

### Git
`git init` · `git add` · `git commit` · `git status` · `git log` · `git branch` · `git checkout` · `git merge` · `git reset --soft` · `git reset --hard` · `git revert` · `git rebase`

### Terminal
`ls` · `cd` · `pwd` · `cat` · `touch` · `mkdir` · `rm` · `clear` · `help`

---

## Architecture

The engine is structured in four layers:

```
Types  →  File System  →  Git State  →  Command Dispatcher
                                              ↓
                                      Graph Deriver  →  React Flow UI
```

**Git Engine** (`lib/engine/`) — pure TypeScript state machine. Models commits as graph nodes with snapshot arrays, branches as pointers, and uses BFS for ancestor traversal. Immutable — every command returns a new state object.

**Command Dispatcher** (`lib/engine/commandDispatcher.ts`) — parses raw terminal input, routes to the correct handler, enforces per-exercise allowed command lists.

**Graph Deriver** (`lib/graphDeriver.ts`) — converts `GitState` into React Flow nodes and edges. Computes reachable commits via parent-chain traversal (fixing the known `git reset` graph bug), assigns lane positions for branching layouts, and highlights the HEAD commit.

**Exercise System** (`exercises/`) — each exercise is a config file defining the initial file structure, allowed commands, step instructions, goal description, and a `successCondition` function evaluated against live engine state.

---

## Local Development

```bash
git clone https://github.com/JP2324/git_web_engine.git
cd git_web_engine
npm install
npm run dev
```

Open `http://localhost:3000`

---

## Project Structure

```
app/
  page.tsx              # Landing page
  learn/[exerciseId]/   # Exercise pages
  playground/           # Free-form sandbox
  docs/                 # Git command reference

components/
  navbar.tsx
  hero.tsx
  footer.tsx
  git-flow-example.tsx  # Reusable React Flow wrapper
  docs-section.tsx
  docs-sidebar.tsx

exercises/
  exercise-1/ through exercise-10/

lib/
  engine/
    types.ts            # Core type definitions
    fileSystem.ts       # Immutable FS operations
    gitState.ts         # Git state factory + helpers
    commandDispatcher.ts
  commands/
    git/                # gitInit, gitAdd, gitCommit, etc.
    terminal/           # ls, cd, touch, rm, etc.
  graphDeriver.ts       # GitState → React Flow nodes/edges
```

---

## Design

- Dark mode only
- Git-inspired accent color: `#F05032`
- Terminal-first learning — the graph is a consequence of commands, not the focus
- No gamification — exercises reward understanding, not points

---

