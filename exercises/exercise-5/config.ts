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
        "Type `git init` to initialize a new Git repository.",
        "Type `git add .` to stage all files, then type `git commit -m \"initial commit\"` to create the first commit on main. This is the base that both branches will share.",
        "Type `git branch feature` to create the feature branch. At this point both main and feature point to the same commit — you can see both labels on one node in the graph.",
        "Type `git checkout feature` to switch to the feature branch. You are now working on feature and any commits you make will only advance this branch.",
        "Type `touch newfeature.js` to create a new file, then `git add .` and `git commit -m \"add feature\"`. Notice in the graph that feature has moved forward but main has stayed on the original commit.",
        "Type `git checkout main` to switch back to main. Notice newfeature.js disappears from the file tree — it only exists on the feature branch so far.",
        "Type `git merge feature` to merge the feature branch into main. Because main never moved after branching, Git does not need to create a new merge commit — it simply moves the main pointer forward to where feature already is. This is a fast-forward. Watch both branch labels land on the same commit node in the graph and newfeature.js reappear in the file tree."
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
