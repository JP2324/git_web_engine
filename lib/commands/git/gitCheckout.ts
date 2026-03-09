import type { CommandHandler, CommandResult, DirectoryNode } from "../../engine/types";
import { getAllFilePaths } from "../../engine/fileSystem";
import { getFileStatus } from "../../engine/gitState";

const NOT_A_REPO =
    "fatal: not a git repository (or any of the parent directories): .git";

const gitCheckout: CommandHandler = (state, args): CommandResult => {
    if (!state.git.isInitialized) {
        return { state, output: NOT_A_REPO };
    }

    // Exactly one argument required
    if (args.length === 0 || args.length !== 1) {
        return { state, output: "error: branch name required" };
    }

    const branch = args[0];

    // Already on this branch
    if (branch === state.git.currentBranch) {
        return { state, output: `Already on '${branch}'` };
    }

    // Branch must exist
    if (!(branch in state.git.branches)) {
        return {
            state,
            output: `error: pathspec '${branch}' did not match any branch`,
        };
    }

    // Step 1: Find the commit ID of the target branch
    const commitId = state.git.branches[branch];
    let restoredFileSystem = state.fileSystem;

    // Step 2 & 3: If commitId exists, locate the commit object
    if (commitId) {
        const commit = state.git.commits.find((c) => c.id === commitId);
        if (commit) {
            // Step 4: Restore the working directory from the commit snapshot
            const newRoot: DirectoryNode = { type: "directory", children: {} };

            // Determine untracked files in the current working directory
            const allCurrentFiles = getAllFilePaths(state.fileSystem.root, "/root");
            const untrackedFiles = allCurrentFiles.filter(
                (fp) => !state.git.trackedFiles.has(fp)
            );

            // Rebuild the snapshot + untracked files
            const filesToRestore = new Set([...commit.snapshot, ...untrackedFiles]);

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
        }
    }

    // Step 5 & 6: Clear the staging area and update currentBranch
    return {
        state: {
            ...state,
            fileSystem: restoredFileSystem,
            git: {
                ...state.git,
                currentBranch: branch,
                stagedFiles: new Set<string>(),
            },
        },
        output: `Switched to branch '${branch}'`,
    };
};

export default gitCheckout;
