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
        "Initialize a repository using git init.",
        "Stage all files and create the first commit.",
        "Modify a file and create a second commit.",
        "Create a new branch named feature using git branch feature.",
        "Switch to the feature branch using git checkout feature.",
        "Modify a file, stage it, and commit on the feature branch.",
        "Switch back to main using git checkout main.",
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
