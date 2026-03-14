import type { CommandHandler, CommandResult, Commit, DirectoryNode } from "../../engine/types";
import { getAllFilePaths } from "../../engine/fileSystem";

const NOT_A_REPO = "fatal: not a git repository (or any of the parent directories): .git";

const gitRevert: CommandHandler = (state, args): CommandResult => {
    if (!state.git.isInitialized) {
        return { state, output: NOT_A_REPO };
    }

    if (args.length === 0) {
        return {
            state,
            output: "usage: git revert <commitId>",
        };
    }

    const currentBranch = state.git.currentBranch;
    const currentTipId = state.git.branches[currentBranch];

    if (!currentTipId) {
        return {
            state,
            output: "error: no commits on current branch to revert",
        };
    }

    const targetId = args[0];
    const targetCommit = state.git.commits.find((c) => c.id === targetId);

    if (!targetCommit) {
        return {
            state,
            output: `error: commit '${targetId}' not found`,
        };
    }

    // Reachability check
    const commitMap = new Map<string, Commit>();
    for (const c of state.git.commits) {
        commitMap.set(c.id, c);
    }

    let isReachable = false;
    let currId: string | undefined = currentTipId;

    while (currId) {
        if (currId === targetId) {
            isReachable = true;
            break;
        }
        const currCommit = commitMap.get(currId);
        currId = currCommit?.parents[0];
    }

    if (!isReachable) {
        return {
            state,
            output: `error: commit '${targetId}' is not in the history of the current branch`,
        };
    }

    // Determine the snapshot of the commit before the target commit
    let revertSnapshot: string[] = [];
    if (targetCommit.parents.length > 0) {
        const parentId = targetCommit.parents[0];
        const parentCommit = commitMap.get(parentId);
        if (parentCommit) {
            revertSnapshot = parentCommit.snapshot;
        }
    }

    // Create the revert commit
    const newCounter = state.git.commitCounter + 1;
    const newCommitId = `C${newCounter}`;
    const newCommitMessage = `Revert "${targetCommit.message}"`;

    const newCommit: Commit = {
        id: newCommitId,
        message: newCommitMessage,
        parents: [currentTipId],
        timestamp: Date.now(),
        snapshot: [...revertSnapshot],
    };

    let restoredFileSystem = state.fileSystem;

    const newRoot: DirectoryNode = { type: "directory", children: {} };

    // Determine untracked files in the current working directory
    const allCurrentFiles = getAllFilePaths(state.fileSystem.root, "/root");
    const untrackedFiles = allCurrentFiles.filter(
        (fp) => !state.git.trackedFiles.has(fp)
    );

    // Rebuild the snapshot + untracked files
    const filesToRestore = new Set([...revertSnapshot, ...untrackedFiles]);

    for (const filePath of filesToRestore) {
        const parts = filePath.split("/").filter(Boolean);
        if (parts.length === 0 || parts[0] !== "root") continue;

        let current = newRoot;
        for (let i = 1; i < parts.length - 1; i++) {
            const dirName = parts[i];
            if (!current.children[dirName]) {
                current.children[dirName] = { type: "directory", children: {} };
            }
            current = current.children[dirName] as DirectoryNode;
        }

        const fileName = parts[parts.length - 1];
        if (fileName) {
            current.children[fileName] = { type: "file" };
        }
    }

    restoredFileSystem = {
        ...state.fileSystem,
        root: newRoot,
    };

    return {
        state: {
            ...state,
            fileSystem: restoredFileSystem,
            git: {
                ...state.git,
                commits: [...state.git.commits, newCommit],
                branches: { ...state.git.branches, [currentBranch]: newCommitId },
                stagedFiles: new Set<string>(),
                trackedFiles: new Set<string>(revertSnapshot),
                commitCounter: newCounter,
            },
        },
        output: `[${currentBranch} ${newCommitId}] ${newCommitMessage}`,
    };
};

export default gitRevert;
