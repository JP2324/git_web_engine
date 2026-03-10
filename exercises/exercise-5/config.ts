import type { ExerciseConfig, DirectoryNode, EngineState } from "@/lib/engine/types";

const initialFileStructure: DirectoryNode = {
    type: "directory",
    children: {
        "index.js": { type: "file" },
        "app.js": { type: "file" },
        "utils.js": { type: "file" },
    },
};

export const exercise5Config: ExerciseConfig = {
    id: 5,
    title: "Fast-Forward Merge",
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
        "Initialize a repository using git init.",
        "Stage all files and create the first commit on main.",
        "Create a new branch named feature using git branch feature.",
        "Switch to the feature branch using git checkout feature.",
        "Modify a file, stage it, and create another commit on feature.",
        "Switch back to main using git checkout main.",
        "Merge the feature branch into main using git merge feature. Watch the graph perform a fast-forward merge!",
    ],
    goal: "Learn how to perform a fast-forward merge. Because main did not diverge from feature, Git just moves the main pointer forward to join feature, without a new merge commit.",
    successCondition: (state: EngineState): boolean => {
        return (
            "feature" in state.git.branches &&
            state.git.branches.feature !== null &&
            state.git.branches.feature === state.git.branches.main &&
            state.git.currentBranch === "main" &&
            state.git.commits.length >= 2
        );
    },
};
