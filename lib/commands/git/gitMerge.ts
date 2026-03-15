import type { CommandHandler, CommandResult, DirectoryNode, Commit } from "../../engine/types";
import { getAllFilePaths } from "../../engine/fileSystem";

const NOT_A_REPO =
    "fatal: not a git repository (or any of the parent directories): .git";

const gitMerge: CommandHandler = (state, args): CommandResult => {
    if (!state.git.isInitialized) {
        return { state, output: NOT_A_REPO };
    }

    if (args.length === 0 || args.length !== 1) {
        return { state, output: "error: branch name required" };
    }

    const targetBranch = args[0];
    const currentBranch = state.git.currentBranch;

    if (targetBranch === currentBranch) {
        return { state, output: "Already up to date." };
    }

    if (!(targetBranch in state.git.branches)) {
        return { state, output: `merge: ${targetBranch} - not something we can merge` };
    }

    const targetCommitId = state.git.branches[targetBranch];
    if (!targetCommitId) {
        return { state, output: `error: branch '${targetBranch}' has no commits` };
    }

    const currentCommitId = state.git.branches[currentBranch];

    // If current branch has no commits, technically an empty repo fast-forward
    // but in this emulator's context, let's just allow it as a fast-forward
    if (!currentCommitId) {
        // ... perform fast-forward to targetCommitId
    } else {
        // Ancestry check
        // Check if target is an ancestor of current
        if (isAncestor(state.git.commits, targetCommitId, currentCommitId)) {
            return { state, output: "Already up to date." };
        }

        // Check if current is an ancestor of target (fast-forward)
        if (!isAncestor(state.git.commits, currentCommitId, targetCommitId)) {
            // --- Three-Way Merge ---
            const targetCommit = state.git.commits.find((c) => c.id === targetCommitId);
            const currentCommit = state.git.commits.find((c) => c.id === currentCommitId);

            if (!targetCommit || !currentCommit) {
                return { state, output: "error: unable to find target or current commit" };
            }

            const newCounter = state.git.commitCounter + 1;
            const newCommitId = `C${newCounter}`;

            const mergedSnapshotItems = new Set([...currentCommit.snapshot, ...targetCommit.snapshot]);
            const mergedSnapshot = Array.from(mergedSnapshotItems);

            const allCurrentFiles = getAllFilePaths(state.fileSystem.root, "/root");
            const untrackedFiles = allCurrentFiles.filter(
                (fp) => !state.git.trackedFiles.has(fp)
            );

            const newRoot: DirectoryNode = { type: "directory", children: {} };

            const filesToRestore = new Set([...mergedSnapshot, ...untrackedFiles]);

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

            const restoredFileSystem = {
                ...state.fileSystem,
                root: newRoot,
            };

            const newCommit: Commit = {
                id: newCommitId,
                message: `Merge branch '${targetBranch}' into ${currentBranch}`,
                parents: [currentCommitId, targetCommitId],
                timestamp: Date.now(),
                snapshot: mergedSnapshot,
            };

            return {
                state: {
                    ...state,
                    fileSystem: restoredFileSystem,
                    git: {
                        ...state.git,
                        commits: [...state.git.commits, newCommit],
                        branches: {
                            ...state.git.branches,
                            [currentBranch]: newCommitId,
                        },
                        stagedFiles: new Set<string>(), // clear staging area on merge like commit does
                        trackedFiles: new Set<string>(mergedSnapshot),
                        commitCounter: newCounter,
                    },
                },
                output: `Merge branch '${targetBranch}' into ${currentBranch}\nMerge commit: ${newCommitId}\nParents: ${currentCommitId}, ${targetCommitId}`,
            };
        }
    }

    // --- Fast-Forward Merge ---

    // 1. Update file system (like checkout)
    const targetCommit = state.git.commits.find((c) => c.id === targetCommitId);
    let restoredFileSystem = state.fileSystem;
    let newTrackedFiles = state.git.trackedFiles;

    if (targetCommit) {
        const targetSnapshot = targetCommit.snapshot;

        const allCurrentFiles = getAllFilePaths(state.fileSystem.root, "/root");
        const untrackedFiles = allCurrentFiles.filter(
            (fp) => !state.git.trackedFiles.has(fp)
        );

        const newRoot: DirectoryNode = { type: "directory", children: {} };

        const filesToRestore = new Set([...targetSnapshot, ...untrackedFiles]);

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
        newTrackedFiles = new Set<string>(targetSnapshot);
    }

    // 2. Update branches
    return {
        state: {
            ...state,
            fileSystem: restoredFileSystem,
            git: {
                ...state.git,
                branches: {
                    ...state.git.branches,
                    [currentBranch]: targetCommitId,
                },
                stagedFiles: new Set<string>(), // clear staging area on merge like checkout does
                trackedFiles: newTrackedFiles,
            },
        },
        output: `Updating ${currentCommitId?.substring(0, 7) || "HEAD"}..${targetCommitId.substring(0, 7)}\nFast-forward`,
    };
};

/**
 * BFS to check if `potentialAncestorId` is an ancestor of `commitId`.
 */
function isAncestor(commits: Commit[], potentialAncestorId: string, commitId: string): boolean {
    if (potentialAncestorId === commitId) return true;

    const queue: string[] = [commitId];
    const visited = new Set<string>();

    while (queue.length > 0) {
        const currentId = queue.shift()!;
        if (visited.has(currentId)) continue;
        visited.add(currentId);

        if (currentId === potentialAncestorId) return true;

        const commit = commits.find((c) => c.id === currentId);
        if (commit) {
            queue.push(...commit.parents);
        }
    }

    return false;
}

export default gitMerge;
