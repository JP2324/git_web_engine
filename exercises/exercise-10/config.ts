import type { ExerciseConfig, DirectoryNode, EngineState } from "@/lib/engine/types";

const initialFileStructure: DirectoryNode = {
    type: "directory",
    children: {
        "index.html": { type: "file" },
        "app.js": { type: "file" },
    },
};

export const exercise10Config: ExerciseConfig = {
    id: 10,
    title: "Full Workflow",
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
        "git checkout",
        "git merge",
        "git rebase",
        "git revert",
        "git reset"
    ],
    steps: [
        "Type `git init` to initialize a new Git repository. Stage and commit twice to create a base history: `touch file1.txt`, `git add .`, `git commit -m \"first commit\"`, then `touch file2.txt`, `git add .`, `git commit -m \"second commit\"`.",
        "Type `git branch feature` to create a new branch, and `git checkout feature` to switch to it. Make two commits on this branch: `touch file3.txt`, `git add .`, `git commit -m \"feature commit 1\"`, then `touch file4.txt`, `git add .`, `git commit -m \"feature commit 2\"`. The graph now shows a fork.",
        "Type `git checkout main` to switch back to main, and make one more commit: `touch file5.txt`, `git add .`, `git commit -m \"third commit on main\"`. Both branches now have unique commits past their common ancestor, creating a genuine fork.",
        "Type `git checkout feature` to switch to your feature branch, then type `git rebase main` to rebase it onto main. Watch the graph transform from a fork into a straight line.",
        "Type `git checkout main` to switch to main, then type `git merge feature`. Since feature is directly ahead of main after the rebase, this is a fast-forward merge. Main's pointer advances, and the graph stays linear.",
        "Make a mistake by creating a bad commit on main: `touch mistake.txt`, `git add .`, `git commit -m \"bad commit\"`. Type `git log` to find its short commit ID, then type `git revert <id>` to safely undo it. Notice a new revert commit appears on the graph.",
        "Type `git log` to observe the full clean linear history from the initial commit through to the revert commit. You have successfully completed the capstone workflow!"
    ],
    goal: "Combine everything you've learned into a single cohesive real-world workflow: branching, diverging, rebasing, merging, making a mistake, and safely undoing it.",
    successCondition: (state: EngineState): boolean => {
        if (!state.git.isInitialized) return false;
        if (state.git.currentBranch !== "main") return false;

        const mainTipId = state.git.branches["main"];
        const featureTipId = state.git.branches["feature"];
        if (!mainTipId || !featureTipId) return false;

        if (state.git.commits.length < 7) return false;

        const hasRevertMessage = state.git.commits.some(c => c.message.startsWith("Revert"));
        if (!hasRevertMessage) return false;

        // The reachable commit chain from the main branch tip is fully linear — no commit in that chain has more than one parent
        let currentCommitId: string | undefined = mainTipId;
        while (currentCommitId) {
            const commit = state.git.commits.find(c => c.id === currentCommitId);
            if (!commit) break;

            if (commit.parents.length > 1) return false; // Not fully linear

            currentCommitId = commit.parents.length === 1 ? commit.parents[0] : undefined;
        }

        return true;
    },
};
