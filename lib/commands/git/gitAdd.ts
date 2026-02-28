import type { CommandHandler, CommandResult } from "../../engine/types";
import { getAllFilePaths } from "../../engine/fileSystem";
import { getFileStatus } from "../../engine/gitState";
import { resolvePath, getNode } from "../../engine/fileSystem";

const NOT_A_REPO =
    "fatal: not a git repository (or any of the parent directories): .git";

const gitAdd: CommandHandler = (state, args): CommandResult => {
    if (!state.git.isInitialized) {
        return { state, output: NOT_A_REPO };
    }

    if (args.length === 0) {
        return { state, output: "Nothing specified, nothing added." };
    }

    const target = args[0];

    if (target === ".") {
        return addAll(state);
    }

    return addFile(state, target);
};

function addAll(state: import("../../engine/types").EngineState): CommandResult {
    // Get all file paths in the entire root tree
    const allFiles = getAllFilePaths(state.fileSystem.root, "/root");

    const toStage = allFiles.filter(
        (fp) => getFileStatus(state.git, fp) === "untracked"
    );

    if (toStage.length === 0) {
        return { state, output: "No untracked files to add." };
    }

    const newStaged = new Set(state.git.stagedFiles);
    for (const fp of toStage) {
        newStaged.add(fp);
    }

    return {
        state: {
            ...state,
            git: { ...state.git, stagedFiles: newStaged },
        },
        output: `${toStage.length} file${toStage.length > 1 ? "s" : ""} added to staging area.`,
    };
}

function addFile(
    state: import("../../engine/types").EngineState,
    fileName: string
): CommandResult {
    // Resolve the path relative to cwd
    const resolved = resolvePath(state.fileSystem, fileName);
    const node = getNode(state.fileSystem, resolved);

    if (!node) {
        return {
            state,
            output: `fatal: pathspec '${fileName}' did not match any files`,
        };
    }

    if (node.type === "directory") {
        // Add all files inside this directory
        const dirFiles = getAllFilePaths(
            node as import("../../engine/types").DirectoryNode,
            resolved
        );
        const toStage = dirFiles.filter(
            (fp) => getFileStatus(state.git, fp) === "untracked"
        );

        if (toStage.length === 0) {
            return { state, output: "No untracked files to add." };
        }

        const newStaged = new Set(state.git.stagedFiles);
        for (const fp of toStage) {
            newStaged.add(fp);
        }

        return {
            state: {
                ...state,
                git: { ...state.git, stagedFiles: newStaged },
            },
            output: `${toStage.length} file${toStage.length > 1 ? "s" : ""} added to staging area.`,
        };
    }

    // Single file
    const status = getFileStatus(state.git, resolved);

    if (status === "staged") {
        return { state, output: `'${fileName}' is already staged.` };
    }

    if (status === "tracked_clean") {
        return { state, output: `'${fileName}' is already tracked and clean.` };
    }

    const newStaged = new Set(state.git.stagedFiles);
    newStaged.add(resolved);

    return {
        state: {
            ...state,
            git: { ...state.git, stagedFiles: newStaged },
        },
        output: `'${fileName}' added to staging area.`,
    };
}

export default gitAdd;
