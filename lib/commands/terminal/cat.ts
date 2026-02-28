import type { CommandHandler, CommandResult } from "../../engine/types";
import { resolvePath, getNode } from "../../engine/fileSystem";

const cat: CommandHandler = (state, args): CommandResult => {
    if (args.length === 0) {
        return { state, output: "cat: missing operand" };
    }

    const target = args[0];
    const resolved = resolvePath(state.fileSystem, target);
    const node = getNode(state.fileSystem, resolved);

    if (!node) {
        return { state, output: `cat: ${target}: No such file or directory` };
    }

    if (node.type === "directory") {
        return { state, output: `cat: ${target}: Is a directory` };
    }

    // No file content storage in Learn mode
    return { state, output: "(empty file)" };
};

export default cat;
