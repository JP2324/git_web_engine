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
        "Use ls to see files in your working directory.",
        "Run git init to initialize a new Git repository.",
        "Check git status to see untracked files.",
        "Stage some or all files using git add . or git add <file>.",
        'Create your first commit with git commit -m "first commit".',
        "Create new files with touch <filename> to have something new to stage.",
        "Stage and commit again to build a linear history of at least 3 commits.",
    ],
    goal: "Create multiple commits in a clean linear history. Initialize a repository, stage files, and commit at least 3 times to complete this exercise.",
    successCondition: (state: EngineState): boolean => {
        return state.git.commits.length >= 3;
    },
};
