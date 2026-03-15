import type { CommandHandler, CommandResult, Commit, DirectoryNode } from "../../engine/types";
import { getAllFilePaths } from "../../engine/fileSystem";

const NOT_A_REPO = "fatal: not a git repository (or any of the parent directories): .git";

const gitRebase: CommandHandler = (state, args): CommandResult => {
    if (!state.git.isInitialized) {
        return { state, output: NOT_A_REPO };
    }

    if (args.length === 0 || args.length !== 1) {
        return { state, output: "error: branch name required" };
    }

    const targetBranch = args[0];
    const currentBranch = state.git.currentBranch;

    if (!(targetBranch in state.git.branches)) {
        return { state, output: `error: branch '${targetBranch}' not found` };
    }

    if (targetBranch === currentBranch) {
        return { state, output: `error: cannot rebase '${currentBranch}' onto itself` };
    }

    const targetCommitId = state.git.branches[targetBranch];
    if (!targetCommitId) {
        return { state, output: `error: branch '${targetBranch}' has no commits` };
    }

    const currentCommitId = state.git.branches[currentBranch];
    if (!currentCommitId) {
        return { state, output: `error: current branch has no commits` };
    }

    // Ancestry check: is target an ancestor of current? -> Already up to date
    if (isAncestor(state.git.commits, targetCommitId, currentCommitId)) {
        return { state, output: `Current branch ${currentBranch} is up to date.` };
    }

    // Ancestry check: is current an ancestor of target? -> Fast-forward
    if (isAncestor(state.git.commits, currentCommitId, targetCommitId)) {
        // Fast-Forward Merge logic (similar to merge)
        const targetCommit = state.git.commits.find((c) => c.id === targetCommitId);
        let restoredFileSystem = state.fileSystem;

        if (targetCommit) {
            const newRoot: DirectoryNode = { type: "directory", children: {} };
            const allCurrentFiles = getAllFilePaths(state.fileSystem.root, "/root");
            const untrackedFiles = allCurrentFiles.filter(
                (fp) => !state.git.trackedFiles.has(fp)
            );

            const filesToRestore = new Set([...targetCommit.snapshot, ...untrackedFiles]);

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

            restoredFileSystem = { ...state.fileSystem, root: newRoot };
        }

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
                    stagedFiles: new Set<string>(),
                },
            },
            output: `Updating ${currentCommitId.substring(0, 7)}..${targetCommitId.substring(0, 7)}\nFast-forward`,
        };
    }

    // Rebase: identify commits to replay
    // First, find all reachable commits from target
    const targetReachable = getReachableCommits(state.git.commits, targetCommitId);
    
    // Walk parent chain from current base back to common ancestor
    const commitsToReplay: Commit[] = [];
    let currId: string | undefined = currentCommitId;
    
    while (currId && !targetReachable.has(currId)) {
        const commit = state.git.commits.find(c => c.id === currId);
        if (!commit) break;
        commitsToReplay.push(commit);
        // We assume linear history for the branch being rebased, per visual terminal constraints
        currId = commit.parents[0];
    }
    
    // Reverse to get chronological sequence (oldest first)
    commitsToReplay.reverse();

    // Replay commits
    let parentPointer = targetCommitId;
    let currentCounter = state.git.commitCounter;
    const newCommits: Commit[] = [];
    const outputLines: string[] = [
        `Rebasing (${currentBranch}) onto ${targetBranch}...`
    ];
    let latestSnapshot: string[] = [];

    // Base timestamp offset to ensure graph layout strictly maintains left-to-right sorting
    const baseTimestamp = Date.now();

    for (let i = 0; i < commitsToReplay.length; i++) {
        const oldCommit = commitsToReplay[i];
        currentCounter++;
        const newCommitId = `C${currentCounter}`;
        
        const newCommit: Commit = {
            id: newCommitId,
            message: oldCommit.message,
            parents: [parentPointer],
            timestamp: baseTimestamp + i,
            snapshot: [...oldCommit.snapshot],
        };
        
        newCommits.push(newCommit);
        parentPointer = newCommitId;
        latestSnapshot = newCommit.snapshot;
        
        outputLines.push(`Replayed ${oldCommit.id} as ${newCommitId}: ${oldCommit.message}`);
    }

    outputLines.push(`Successfully rebased and updated refs/heads/${currentBranch}.`);

    // File system restoration for the final replayed commit
    const newRoot: DirectoryNode = { type: "directory", children: {} };
    const allCurrentFiles = getAllFilePaths(state.fileSystem.root, "/root");
    const untrackedFiles = allCurrentFiles.filter(
        (fp) => !state.git.trackedFiles.has(fp)
    );

    const filesToRestore = new Set([...latestSnapshot, ...untrackedFiles]);

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

    const restoredFileSystem = { ...state.fileSystem, root: newRoot };

    return {
        state: {
            ...state,
            fileSystem: restoredFileSystem,
            git: {
                ...state.git,
                commits: [...state.git.commits, ...newCommits],
                branches: {
                    ...state.git.branches,
                    [currentBranch]: parentPointer,
                },
                stagedFiles: new Set<string>(),
                trackedFiles: new Set(latestSnapshot),
                commitCounter: currentCounter,
            },
        },
        output: outputLines.join("\n"),
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

/**
 * Returns a Set of all commit IDs reachable from the startCommitId.
 */
function getReachableCommits(commits: Commit[], startCommitId: string): Set<string> {
    const reachable = new Set<string>();
    const queue = [startCommitId];
    
    while(queue.length > 0) {
        const id = queue.shift()!;
        if (reachable.has(id)) continue;
        reachable.add(id);
        
        const commit = commits.find(c => c.id === id);
        if (commit) {
            queue.push(...commit.parents);
        }
    }
    
    return reachable;
}

export default gitRebase;
