import type { ExerciseConfig, DirectoryNode, EngineState } from "@/lib/engine/types";

const initialFileStructure: DirectoryNode = {
    type: "directory",
    children: {
        "index.html": { type: "file" },
    },
};

export const exercise8Config: ExerciseConfig = {
    id: 8,
    title: "Safe Undo with Revert",
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
        "git revert",
    ],
    steps: [
        "Type `git init` to initialize a new Git repository. Stage your files with `git add .` and create your first commit with `git commit -m \"first commit\"`.",
        "Type `touch styles.css` to create a new file. Stage it with `git add .` and commit it with `git commit -m \"second commit\"`.",
        "Type `touch script.js` to create another file. Stage and commit it with `git add .` and `git commit -m \"third commit\"`. You should now have a linear history of 3 commits.",
        "Type `git log` and find the short hash ID for your \"second commit\" (it should look like `C2`).",
        "Type `git revert <commitId>` (replacing `<commitId>` with the exact hash from the previous step) to safely undo the changes introduced by the second commit. Notice how a new fourth commit appears on the graph with a revert message, instead of deleting existing commits."
    ],
    goal: "Learn how to use git revert to safely undo a commit by creating a new commit that reverses its changes.",
    successCondition: (state: EngineState): boolean => {
        return (
            state.git.isInitialized === true &&
            state.git.commits.length >= 4 &&
            state.git.commits.some(c => c.message.startsWith("Revert"))
        );
    },
};
