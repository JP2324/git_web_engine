import type { ExerciseConfig, DirectoryNode, EngineState } from "@/lib/engine/types";

const initialFileStructure: DirectoryNode = {
    type: "directory",
    children: {
        "index.js": { type: "file" },
        "app.js": { type: "file" },
    },
};

export const exercise7Config: ExerciseConfig = {
    id: 7,
    title: "Undoing with Reset",
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
        "git reset",
    ],
    steps: [
        "Type `git init` to initialize a new Git repository. Then stage your files with `git add .` and create your first commit with `git commit -m \"first commit\"`.",
        "Type `touch feature.js` to create a new file. Stage it with `git add .` and commit it with `git commit -m \"second commit\"`. You should now see two commit nodes in the graph.",
        "Type `touch utils.js` to create another file. Stage and commit it with `git add .` and `git commit -m \"third commit\"`. You now have a linear history of 3 commits.",
        "Type `git reset --soft HEAD~1` to undo the third commit while keeping its files staged. Notice how the third commit node disappears from the graph, and the branch pointer moves back. Type `git status` to observe that `utils.js` has been returned to the staging area.",
        "Finally, type `git reset --hard HEAD~1` to completely discard the second commit and its files. The graph shrinks again to just the first commit. Type `ls` to observe that `feature.js` has been permanently deleted from your working directory."
    ],
    goal: "Learn how to use git reset to undo commits. Build a history of 3 commits, use --soft reset to keep changes staged, and use --hard reset to discard changes.",
    successCondition: (state: EngineState): boolean => {
        if (!state.git.isInitialized || state.git.commits.length === 0) return false;

        const currentTipId = state.git.branches[state.git.currentBranch];
        if (!currentTipId) return false;

        let reachableCount = 0;
        let currentCommit = state.git.commits.find(c => c.id === currentTipId);
        
        while (currentCommit) {
            reachableCount++;
            if (currentCommit.parents.length > 0) {
                // eslint-disable-next-line no-loop-func
                currentCommit = state.git.commits.find(c => c.id === currentCommit!.parents[0]);
            } else {
                currentCommit = undefined;
            }
        }

        return reachableCount > 0 && reachableCount < state.git.commits.length;
    },
};
