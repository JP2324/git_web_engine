import type { ExerciseConfig, DirectoryNode, EngineState } from "@/lib/engine/types";

const initialFileStructure: DirectoryNode = {
    type: "directory",
    children: {
        "index.js": { type: "file" },
        "app.js": { type: "file" },
        "utils.js": { type: "file" },
    },
};

export const exercise2Config: ExerciseConfig = {
    id: 2,
    title: "Multiple Commits",
    initialFileStructure,
    allowedCommands: [
        "ls",
        "cd",
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
    ],
    steps: [
        "Type `ls` to see the three files in your working directory: index.js, app.js, and utils.js.",
        "Type `git init` to initialize a new Git repository.",
        "Type `git status` to confirm all three files are untracked.",
        "Type `git add .` to stage all files at once, then type `git commit -m \"first commit\"` to create your first commit. Watch the graph update with your first node.",
        "Type `touch feature.js` to create a new file. Type `git status` to see it appear as untracked. Type `git add .` then `git commit -m \"second commit\"` to create your second commit. Notice the graph grows.",
        "Type `touch utils2.js` to create another new file. Stage it with `git add .` and commit it with `git commit -m \"third commit\"`. You now have a linear history of 3 commits visible in the graph.",
        "Type `git log` to review your full commit history. Each commit has a unique hash and builds on top of the previous one."
    ],
    goal: "Create multiple commits in a clean linear history. Initialize a repository, stage files, and commit at least 3 times to complete this exercise.",
    successCondition: (state: EngineState): boolean => {
        return state.git.commits.length >= 3;
    },
};
