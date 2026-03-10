import type { ExerciseConfig, DirectoryNode, EngineState } from "@/lib/engine/types";

const initialFileStructure: DirectoryNode = {
    type: "directory",
    children: {
        "index.js": { type: "file" },
        "app.js": { type: "file" },
        "utils.js": { type: "file" },
    },
};

export const exercise4Config: ExerciseConfig = {
    id: 4,
    title: "Switching Branches",
    initialFileStructure,
    allowedCommands: [
        "ls",
        "pwd",
        "cat",
        "touch",
        "mkdir",
        "rm",
        "clear",
        "help",
        "git init",
        "git status",
        "git add",
        "git commit",
        "git log",
        "git branch",
        "git checkout",
    ],
    steps: [
        "Type `git init` to initialize a new Git repository.",
        "Type `git add .` to stage all files, then type `git commit -m \"initial commit\"` to create your first commit. Type `git status` to confirm the staging area is clean.",
        "Type `touch update.js` to create a new file, then `git add .` and `git commit -m \"second commit\"` to create a second commit. Your main branch now has two commits.",
        "Type `git branch feature` to create the feature branch pointing at your current commit.",
        "Type `git checkout feature` to switch to the feature branch. You are now on feature but the history is identical so far.",
        "Type `touch feature.js` then `git add .` then `git commit -m \"feature commit\"`. This commit belongs only to the feature branch. Watch the graph diverge — feature moves forward while main stays behind.",
        "Type `git checkout main` to switch back to main. Notice feature.js disappears from the file tree — it only exists on the feature branch. The graph shows main and feature pointing to different commits."
    ],
    goal: "Learn how to switch branches using git checkout. Observe how commits belong to the branch that is currently checked out. Create a 'feature' branch with its own commit, then switch back to main.",
    successCondition: (state: EngineState): boolean => {
        return (
            "feature" in state.git.branches &&
            state.git.branches.feature !== null &&
            state.git.branches.feature !== state.git.branches.main &&
            state.git.currentBranch === "main"
        );
    },
};
