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

    // Validate parent
    const parts = resolved.split("/").filter(Boolean);
    const parentPath = "/" + parts.slice(0, -1).join("/");
    const parentNode = getNode(state.fileSystem, parentPath);

    if (!parentNode) {
        return { state, output: `touch: cannot touch '${fileName}': No such file or directory` };
    }
    if (parentNode.type !== "directory") {
        return { state, output: `touch: cannot touch '${fileName}': Not a directory` };
    }

    const newFS = addFile(state.fileSystem, resolved);

    return {
        state: { ...state, fileSystem: newFS },
        output: "",
    };
};

export default touch;
