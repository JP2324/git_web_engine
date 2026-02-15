# 🚀 Git Visual Emulator

An interactive, visual-first Git learning platform built to help developers truly understand how Git works under the hood.

Instead of memorizing commands, users *see* branches, merges, rebases, and commit history evolve in real-time.

---

## 🌑 Built With

* **Next.js (App Router)**
* **TypeScript**
* **Tailwind CSS**
* **shadcn/ui**
* Fully Client-Side Architecture

---

## 🎯 Project Vision

Git is powerful — but confusing.

This project aims to:

* Visualize core Git internals
* Teach essential Git workflows interactively
* Provide structured exercises
* Simulate Git behavior safely in the browser

This is not a full Git reimplementation — it focuses only on **visualizable, high-impact commands**.

---

## 🖥 Current Status

✅ Landing Page Complete
🔄 Git Engine (In Progress)
🔄 Interactive Emulator (Upcoming)

---

## 📚 V1 Learning Path (Core Git Foundations)

The first version will focus only on the most essential and visual Git commands:

### Supported Commands (V1)

* `git init`
* `git commit`
* `git branch`
* `git checkout`
* `git merge`
* `git rebase`
* `git cherry-pick`

These commands cover:

* Commit graph creation
* Branch pointers
* HEAD movement
* Fast-forward merges
* Merge commits (multiple parents)
* History rewriting (rebase)
* Selective commit replay

Commands like `stash`, `reset`, `reflog`, `submodules`, `hooks`, etc. are intentionally **out of scope for V1**.

---

## 🧠 Architecture Overview

The project is structured into four main layers:

```
1. Git Engine (Pure Logic Layer)
2. Command Parser
3. Exercise System
4. UI Layer
```

The Git engine models:

* Commits as graph nodes
* Branch references as pointers
* HEAD state (branch or detached)
* Merge commits with multiple parents
* Rebase transformations
* Cherry-pick duplication logic

No backend.
No database.
Fully client-side simulation.

---

## 🎨 Design Philosophy

* Dark-mode only
* Git-inspired accent (`#F05032`)
* Minimal, developer-focused aesthetic
* Clean spacing and responsive layout
* Premium SaaS-style presentation

---

## 🛠 Local Development

Clone the repository:

```bash
git clone https://github.com/your-username/git-visual-emulator.git
cd git-visual-emulator
```

Install dependencies:

```bash
npm install
```

Run development server:

```bash
npm run dev
```

Open:

```
http://localhost:3000
```

---

## 📌 Why This Project?

This project demonstrates:

* State modeling
* Graph data structures
* Command parsing
* System design thinking
* Interactive UI architecture
* Developer tooling mindset

This is not a CRUD app.
It is a visual Git engine built in the browser.

---

## 🚧 Roadmap (V1)

* [ ] Build core Git engine
* [ ] Implement commit graph logic
* [ ] Implement merge logic (fast-forward + merge commit)
* [ ] Implement rebase logic
* [ ] Implement cherry-pick logic
* [ ] Build interactive terminal UI
* [ ] Connect engine to graph visualization
* [ ] Add structured exercise validation

---

### ✨ Built for developers who think visually.
