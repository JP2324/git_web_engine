import type { GitState } from "./types";

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

export function createInitialGitState(): GitState {
    return {
        isInitialized: false,
        currentBranch: "",
        commits: [],
        stagedFiles: new Set<string>(),
        trackedFiles: new Set<string>(),
        branches: {},
        commitCounter: 0,
    };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Determine the status of a file path relative to the current git state.
 * Valid Learn-mode statuses: "untracked" | "staged" | "tracked_clean"
 */
export function getFileStatus(
    git: GitState,
    filePath: string
): "untracked" | "staged" | "tracked_clean" {
    if (git.stagedFiles.has(filePath)) {
        return "staged";
    }
    if (git.trackedFiles.has(filePath)) {
        return "tracked_clean";
    }
    return "untracked";
}
