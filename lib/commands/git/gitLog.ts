import type { CommandHandler, CommandResult } from "../../engine/types";

const NOT_A_REPO =
    "fatal: not a git repository (or any of the parent directories): .git";

const gitLog: CommandHandler = (state, _args): CommandResult => {
    if (!state.git.isInitialized) {
        return { state, output: NOT_A_REPO };
    }

    if (state.git.commits.length === 0) {
        return { state, output: "No commits yet." };
    }

    // Show newest first
    const sorted = [...state.git.commits].sort(
        (a, b) => b.timestamp - a.timestamp
    );

    const lines = sorted.map(
        (commit) => `commit ${commit.id}\nMessage: ${commit.message}`
    );

    return { state, output: lines.join("\n\n") };
};

export default gitLog;
