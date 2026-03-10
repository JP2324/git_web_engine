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
        "Type `git init` to initialize a new Git repository.",
        "Type `git add .` to stage all files, then type `git commit -m \"initial commit\"` to create your first commit. You cannot create branches without at least one commit.",
        "Type `git branch feature` to create a new branch called feature. This creates a new pointer at the current commit — it does not switch to it yet.",
        "Type `git branch dev` to create a second branch called dev. Again, this only creates the pointer.",
        "Type `git branch` to list all branches in the repository. You should see main, feature, and dev listed. The asterisk (*) next to main shows that is your current branch. Notice both new branch labels appear on the same commit node in the graph."
    ],
    goal: "Learn how to create and list branches. Create both a 'feature' and a 'dev' branch to complete this exercise.",
    successCondition: (state: EngineState): boolean => {
        return (
            "feature" in state.git.branches &&
            "dev" in state.git.branches
        );
    },
};
