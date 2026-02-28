import type { CommandHandler, CommandResult } from "../../engine/types";

const clear: CommandHandler = (state, _args): CommandResult => {
    return { state, output: "", clearTerminal: true };
};

export default clear;
