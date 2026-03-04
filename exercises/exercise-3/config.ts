import type { ExerciseConfig, DirectoryNode, EngineState } from "@/lib/engine/types";

const initialFileStructure: DirectoryNode = {
    type: "directory",
    children: {
        "index.js": { type: "file" },
        "app.js": { type: "file" },
        "utils.js": { type: "file" },
    },
};

export const exercise3Config: ExerciseConfig = {
    id: 3,
    title: "Branch Creation",
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
        "git branch",
    ],
    steps: [
        "Initialize a repository using git init.",
        "Stage and commit the files.",
        "Create a branch named feature using git branch feature.",
        "Create another branch named dev using git branch dev.",
        "Verify the branches using git branch.",
    ],
    goal: "Learn how to create and list branches. Create both a 'feature' and a 'dev' branch to complete this exercise.",
    successCondition: (state: EngineState): boolean => {
        return (
            "feature" in state.git.branches &&
            "dev" in state.git.branches
        );
    },
};
