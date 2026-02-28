import type { CommandHandler, CommandResult, Commit } from "../../engine/types";

const NOT_A_REPO =
    "fatal: not a git repository (or any of the parent directories): .git";

const gitCommit: CommandHandler = (state, args): CommandResult => {
    if (!state.git.isInitialized) {
        return { state, output: NOT_A_REPO };
    }

    // Parse -m "message"
    const message = parseCommitMessage(args);
    if (message === null) {
        return {
            state,
            output: 'error: commit message required. Usage: git commit -m "message"',
        };
    }

    if (state.git.stagedFiles.size === 0) {
        return {
            state,
            output: "nothing to commit, working tree clean",
        };
    }

    const newCounter = state.git.commitCounter + 1;
    const commitId = `C${newCounter}`;
    const currentBranch = state.git.currentBranch;
    const parentCommitId = state.git.branches[currentBranch];
    const parents: string[] = parentCommitId ? [parentCommitId] : [];

    // Compute updated tracked set BEFORE creating commit
    // so snapshot captures the full tracked state at this point
    const newTracked = new Set(state.git.trackedFiles);
    for (const fp of state.git.stagedFiles) {
        newTracked.add(fp);
    }

    const newCommit: Commit = {
        id: commitId,
        message,
        parents,
        timestamp: Date.now(),
        snapshot: Array.from(newTracked),
    };

    const fileCount = state.git.stagedFiles.size;

    return {
        state: {
            ...state,
            git: {
                ...state.git,
                commits: [...state.git.commits, newCommit],
                branches: { ...state.git.branches, [currentBranch]: commitId },
                stagedFiles: new Set<string>(),
                trackedFiles: newTracked,
                commitCounter: newCounter,
            },
        },
        output: `[${currentBranch} ${commitId}] ${message}\n${fileCount} file${fileCount > 1 ? "s" : ""} committed.`,
    };
};

/**
 * Extract commit message from args like ["-m", "\"some", "message\""]
 * or ["-m", "\"message\""]
 */
function parseCommitMessage(args: string[]): string | null {
    const mIdx = args.indexOf("-m");
    if (mIdx === -1 || mIdx >= args.length - 1) return null;

    // Join everything after -m and strip surrounding quotes
    const raw = args.slice(mIdx + 1).join(" ");
    const match = raw.match(/^"(.+)"$/);
    if (match) return match[1];

    // Also accept unquoted single-word message
    if (raw.length > 0 && !raw.includes(" ")) return raw;

    return null;
}

export default gitCommit;
