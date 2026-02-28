import type { CommandHandler, CommandResult } from "../../engine/types";
import { resolvePath, getNode, addDirectory } from "../../engine/fileSystem";

const mkdir: CommandHandler = (state, args): CommandResult => {
    if (args.length === 0) {
        return { state, output: "mkdir: missing operand" };
    }

    const dirName = args[0];
    const resolved = resolvePath(state.fileSystem, dirName);
    const existing = getNode(state.fileSystem, resolved);

    if (existing) {
        return { state, output: `mkdir: cannot create directory '${dirName}': File exists` };
    }

    const newFS = addDirectory(state.fileSystem, resolved);

    return {
        state: { ...state, fileSystem: newFS },
        output: "",
    };
};

export default mkdir;
