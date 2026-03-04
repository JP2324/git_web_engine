import type { CommandHandler, CommandResult } from "../../engine/types";

const NOT_A_REPO =
    "fatal: not a git repository (or any of the parent directories): .git";

const gitBranch: CommandHandler = (state, args): CommandResult => {
    if (!state.git.isInitialized) {
        return { state, output: NOT_A_REPO };
    }

    // ---- git branch (list) ----
    if (args.length === 0) {
        const currentBranch = state.git.currentBranch;
        const otherBranches = Object.keys(state.git.branches)
            .filter((b) => b !== currentBranch)
            .sort();

        const lines: string[] = [`* ${currentBranch}`];
        for (const branch of otherBranches) {
            lines.push(`  ${branch}`);
        }

        return { state, output: lines.join("\n") };
    }

    // ---- git branch <name> (create) ----
    if (args.length !== 1) {
        return { state, output: "fatal: invalid branch name" };
    }

    const name = args[0];

    // Validate branch name
    if (name.length === 0 || name.includes(" ") || name === "HEAD") {
        return { state, output: "fatal: invalid branch name" };
    }

    // Check for duplicate
    if (name in state.git.branches) {
        return {
            state,
            output: `fatal: A branch named '${name}' already exists.`,
        };
    }

    // Branch points to whatever the current branch points to (may be null)
    const headCommit = state.git.branches[state.git.currentBranch];

    return {
        state: {
            ...state,
            git: {
                ...state.git,
                branches: { ...state.git.branches, [name]: headCommit },
            },
        },
        output: "",
    };
};

export default gitBranch;
