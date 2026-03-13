import type { CommandHandler, CommandResult, DirectoryNode, Commit } from "../../engine/types";
import { getAllFilePaths } from "../../engine/fileSystem";

const NOT_A_REPO =
    "fatal: not a git repository (or any of the parent directories): .git";

const gitReset: CommandHandler = (state, args): CommandResult => {
    if (!state.git.isInitialized) {
        return { state, output: NOT_A_REPO };
    }

    if (args.length === 0) {
        return { state, output: "error: Please provide a mode and a target reference. Usage: git reset --<mode> HEAD~<N>" };
    }

    const mode = args[0];
    if (mode !== "--soft" && mode !== "--hard") {
        return { state, output: "error: Only --soft and --hard modes are supported in this exercise." };
    }

    if (args.length < 2) {
        return { state, output: "error: Please provide a target reference. Usage: git reset --<mode> HEAD~<N>" };
    }

    const targetRef = args[1];
    const match = targetRef.match(/^HEAD~([0-9]+)$/);
    if (!match) {
        return { state, output: `error: revision not recognized: ${targetRef}` };
    }

    const currentBranch = state.git.currentBranch;
    const currentTipId = state.git.branches[currentBranch];

    if (!currentTipId) {
        return { state, output: `fatal: ambiguous argument '${targetRef}': unknown revision or path not in the working tree.` };
    }

    const stepsToMove = parseInt(match[1] || "0", 10);
    
    // Walk back the parent chain
    const tipCommit = state.git.commits.find((c) => c.id === currentTipId);
    if (!tipCommit) {
        return { state, output: "fatal: current tip commit not found" }; // Should not happen
    }

    let targetCommit: Commit | undefined = tipCommit;
    let currentStep = 0;

    while (currentStep < stepsToMove) {
        if (!targetCommit || targetCommit.parents.length === 0) {
            targetCommit = undefined;
            break;
        }
        // Always take the first parent for simplicity in this linear-focused exercise
        const parentId = targetCommit.parents[0];
        targetCommit = state.git.commits.find((c) => c.id === parentId);
        currentStep++;
    }

    if (!targetCommit) {
        return { state, output: "fatal: not enough commits to reset that far back" };
    }

    if (mode === "--soft") {
        const newStagedFiles = new Set(state.git.stagedFiles);
        const targetSnapshot = new Set(targetCommit.snapshot);

        for (const fp of tipCommit.snapshot) {
            if (!targetSnapshot.has(fp)) {
                newStagedFiles.add(fp);
            }
        }

        return {
            state: {
                ...state,
                git: {
                    ...state.git,
                    branches: {
                        ...state.git.branches,
                        [currentBranch]: targetCommit.id,
                    },
                    stagedFiles: newStagedFiles,
                },
            },
            output: `Unstaged changes after reset:\nMoved ${currentBranch} from ${tipCommit.id} to ${targetCommit.id}`,
        };
    } else {
        // mode === "--hard"
        let restoredFileSystem = state.fileSystem;

        const newRoot: DirectoryNode = { type: "directory", children: {} };

        // Determine untracked files in the current working directory
        const allCurrentFiles = getAllFilePaths(state.fileSystem.root, "/root");
        const untrackedFiles = allCurrentFiles.filter(
            (fp) => !state.git.trackedFiles.has(fp)
        );

        // Rebuild the snapshot + untracked files
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

        restoredFileSystem = {
            ...state.fileSystem,
            root: newRoot,
        };

        const newTrackedFiles = new Set(targetCommit.snapshot);

        return {
            state: {
                ...state,
                fileSystem: restoredFileSystem,
                git: {
                    ...state.git,
                    branches: {
                        ...state.git.branches,
                        [currentBranch]: targetCommit.id,
                    },
                    stagedFiles: new Set<string>(),
                    trackedFiles: newTrackedFiles,
                },
            },
            output: `HEAD is now at ${targetCommit.id} (hard reset from ${tipCommit.id})\nChanges were completely discarded.`,
        };
    }
};

export default gitReset;
