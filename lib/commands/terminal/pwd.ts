import type { CommandHandler, CommandResult } from "../../engine/types";

const pwd: CommandHandler = (state, _args): CommandResult => {
    return { state, output: state.fileSystem.cwd };
};

export default pwd;
