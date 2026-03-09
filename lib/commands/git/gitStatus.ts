import type { CommandHandler, CommandResult } from "../../engine/types";
import { getAllFilePaths } from "../../engine/fileSystem";
import { getFileStatus } from "../../engine/gitState";

const NOT_A_REPO =
    "fatal: not a git repository (or any of the parent directories): .git";

const gitStatus: CommandHandler = (state, _args): CommandResult => {
    if (!state.git.isInitialized) {
        return { state, output: NOT_A_REPO };
    }

    const branch = state.git.currentBranch;
    const lines: string[] = [`On branch ${branch}`, ""];

    const allFiles = getAllFilePaths(state.fileSystem.root, "/root");

    const staged: string[] = [];
    const untracked: string[] = [];

    // Check all files in the current working directory
    for (const fp of allFiles) {
        if (state.git.stagedFiles.has(fp)) {
            staged.push(fp);
        } else if (!state.git.trackedFiles.has(fp)) {
            untracked.push(fp);
        }
        // If tracked and not staged, do not show
    }

    // Also check staged files that might not be in the file system anymore (deleted)
    for (const fp of state.git.stagedFiles) {
        if (!staged.includes(fp)) {
            staged.push(fp);
        }
    }

    if (staged.length > 0) {
        lines.push("Changes to be committed:");
        for (const fp of staged) {
            // Show path relative to root for readability
            const display = fp.replace(/^\/root\//, "");
            lines.push(`  new file:   ${display}`);
        }
        lines.push("");
    }

    if (untracked.length > 0) {
        lines.push("Untracked files:");
        for (const fp of untracked) {
            const display = fp.replace(/^\/root\//, "");
            lines.push(`  ${display}`);
        }
        lines.push("");
    }

    // Determine closing message
    if (staged.length === 0 && untracked.length === 0) {
        lines.push("nothing to commit, working tree clean");
    } else if (staged.length === 0 && untracked.length > 0) {
        lines.push("nothing added to commit but untracked files present");
    }

    return { state, output: lines.join("\n") };
};

export default gitStatus;
