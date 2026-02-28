import type { CommandHandler, CommandResult } from "../../engine/types";
import { resolvePath, getNode, addFile } from "../../engine/fileSystem";

const touch: CommandHandler = (state, args): CommandResult => {
    if (args.length === 0) {
        return { state, output: "touch: missing file operand" };
    }

    const fileName = args[0];
    const resolved = resolvePath(state.fileSystem, fileName);
    const existing = getNode(state.fileSystem, resolved);

    if (existing) {
        // touch on existing file does nothing (updates timestamp in real system)
        return { state, output: "" };
    }

    const newFS = addFile(state.fileSystem, resolved);

    return {
        state: { ...state, fileSystem: newFS },
        output: "",
    };
};

export default touch;
