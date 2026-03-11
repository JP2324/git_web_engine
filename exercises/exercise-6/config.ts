import type { ExerciseConfig, DirectoryNode, EngineState } from "@/lib/engine/types";

const initialFileStructure: DirectoryNode = {
    type: "directory",
    children: {
        "index.js": { type: "file" },
        "app.js": { type: "file" },
    },
};

export const exercise6Config: ExerciseConfig = {
    id: 6,
    title: "Three-Way Merge",
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
        "git merge",
    ],
    steps: [
        "Type `git init` to initialize a new Git repository.",
        "Type `git add .` to stage the initial files, then type `git commit -m \"initial commit\"` to create the first commit on main. This is the shared base commit.",
        "Type `git branch feature` to create the feature branch.",
        "Type `git checkout feature` to switch to your new branch.",
        "Type `touch feature.js` to create a new file, then `git add .` and `git commit -m \"add feature\"`. This advances the feature branch. Notice in the graph that feature moves forward.",
        "Type `git checkout main` to switch back to the main branch. Notice the graph highlights the main branch again, and feature.js disappears.",
        "Type `touch another.js` to create another file directly on main, then `git add .` and `git commit -m \"add another\"`. This is the critical step that causes divergence — both main and feature now have unique commits since they shared a common base.",
        "Type `git merge feature` to merge the feature branch into main. Because the branches diverged, Git cannot just move the pointer forward (fast-forward). It must create a new \"merge commit\" that has two parents. Watch the graph create a new node with two incoming edges from both main and feature!"
    ],
    goal: "Learn how to perform a three-way merge. When two branches diverge, merging them requires constructing a brand new commit that combines both lines of history.",
    // Success condition: a merge commit (parents.length === 2) exists and we are on main
    successCondition: (state: EngineState): boolean => {
        if (!state.git.isInitialized) return false;

        const hasMergeCommit = state.git.commits.some(c => c.parents.length === 2);

        return (
            hasMergeCommit &&
            state.git.currentBranch === "main"
        );
    },
};
