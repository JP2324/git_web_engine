import type { ExerciseConfig, DirectoryNode, EngineState } from "@/lib/engine/types";

const initialFileStructure: DirectoryNode = {
    type: "directory",
    children: {
        "index.js": { type: "file" },
        "app.js": { type: "file" },
    },
};

export const exercise1Config: ExerciseConfig = {
    id: 1,
    title: "Initialize and First Commit",
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
        "Type `ls` to see the files already in your working directory. You should see index.js and app.js listed.",
        "Type `git init` to initialize a new Git repository. This creates a hidden .git folder that starts tracking your project.",
        "Type `git status` to see the current state of your repository. You will see both files listed as untracked — Git can see them but is not tracking them yet.",
        "Type `git add .` to stage all files. The dot means everything in the current directory. Run `git status` again to confirm they are now staged.",
        "Type `git commit -m \"initial commit\"` to save your staged files as the first snapshot in history. The message describes what this commit contains.",
        "Type `git log` to view your commit history. You should see your commit with its hash, author, date, and message. Notice the graph on the right has updated with your first commit node."
    ],
    goal: "Initialize a Git repository and make your first commit with the files in your working directory.",
    successCondition: (state: EngineState): boolean => {
        return (
            state.git.isInitialized === true &&
            state.git.commits.length >= 1
        );
    },
};
