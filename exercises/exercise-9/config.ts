import type { ExerciseConfig, DirectoryNode, EngineState } from "@/lib/engine/types";

const initialFileStructure: DirectoryNode = {
    type: "directory",
    children: {
        "index.js": { type: "file" },
        "app.js": { type: "file" },
    },
};

export const exercise9Config: ExerciseConfig = {
    id: 9,
    title: "Rebase",
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
        "git rebase",
    ],
    steps: [
        "Type `git init` to initialize a new Git repository.",
        "Type `git add .` to stage the initial files, then type `git commit -m \"initial commit\"` to create the first commit on main.",
        "Type `git branch feature` to create the feature branch.",
        "Type `git checkout feature` to switch to your new branch.",
        "Type `touch feature1.js` to create a new file, then `git add .` and `git commit -m \"add feature 1\"`.",
        "Type `touch feature2.js`, then `git add .` and `git commit -m \"add feature 2\"`.",
        "Type `git checkout main` to switch back to the main branch.",
        "Type `touch another.js`, then `git add .` and `git commit -m \"add another\"` on main. Now `main` and `feature` have genuinely diverged.",
        "Type `git checkout feature` to switch back to the feature branch.",
        "Type `git log` to see the fork in the commit history.",
        "Type `git rebase main` to rebase the feature branch onto main. Watch the graph transform from a fork into a straight line!"
    ],
    goal: "Learn how to use `git rebase`. Instead of creating a merge commit, rebasing takes the commits unique to your branch and reapplies them on top of the target branch, producing a linear history.",
    // Success condition: linear history, main is reachable from feature, 5 or more commits
    successCondition: (state: EngineState): boolean => {
        if (!state.git.isInitialized) return false;
        
        // Ensure we are on feature branch
        if (state.git.currentBranch !== "feature") return false;

        // Ensure linear history for feature tip tip (exactly one parent)
        const currentTipId = state.git.branches["feature"];
        if (!currentTipId) return false;
        
        const currentTip = state.git.commits.find(c => c.id === currentTipId);
        if (!currentTip || currentTip.parents.length !== 1) return false;

        // Check reachability: main branch tip must be reachable from feature branch tip
        const mainTipId = state.git.branches["main"];
        if (!mainTipId) return false;

        // Ensure 5 or more commits have been created in total
        if (state.git.commits.length < 5) return false;

        // Helper to check if potentialAncestor is ancestor of commitId
        const isAncestor = (commits: typeof state.git.commits, potentialAncestorId: string, commitId: string): boolean => {
            if (potentialAncestorId === commitId) return true;
            const queue = [commitId];
            const visited = new Set<string>();
            while (queue.length > 0) {
                const id = queue.shift()!;
                if (visited.has(id)) continue;
                visited.add(id);
                if (id === potentialAncestorId) return true;
                const commit = commits.find(c => c.id === id);
                if (commit) queue.push(...commit.parents);
            }
            return false;
        }

        return isAncestor(state.git.commits, mainTipId, currentTipId);
    },
};
