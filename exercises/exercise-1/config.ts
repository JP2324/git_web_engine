import type { GitState, ExerciseConfig } from "@/lib/types";

const initialState: GitState = {
    isInitialized: false,
    commits: {},
    branches: {},
    HEAD: {
        type: "branch",
        ref: "",
    },
    workingDirectory: [
        { name: "index.js", status: "untracked" },
        { name: "app.js", status: "untracked" },
    ],
    stagingArea: [],
    commitCounter: 0,
};

export const exercise1Config: ExerciseConfig = {
    id: 1,
    title: "Initialize and First Commit",
    initialState,
    allowedCommands: [
        "ls",
        "git init",
        "git status",
        "git add .",
        "git commit",
        "git log",
    ],
    steps: [
        "Use ls to see files in your working directory.",
        "Run git init to initialize a new Git repository.",
        "Check git status to see untracked files.",
        "Stage all files using git add .",
        "Create your first commit with git commit -m \"initial commit\".",
        "View your commit history with git log.",
    ],
    successCondition: (state: GitState): boolean => {
        return (
            state.isInitialized === true &&
            Object.keys(state.commits).length === 1
        );
    },
};
