import type { CommandHandler, CommandResult } from "../../engine/types";

const NOT_A_REPO =
    "fatal: not a git repository (or any of the parent directories): .git";

const gitInit: CommandHandler = (state, _args): CommandResult => {
    if (state.git.isInitialized) {
        return { state, output: "Reinitialized existing Git repository." };
    }

    return {
        state: {
            ...state,
            git: {
                ...state.git,
                isInitialized: true,
                currentBranch: "main",
                branches: { main: null },
            },
        },
        output: "Initialized empty Git repository.",
    };
};

export default gitInit;
export { NOT_A_REPO };
