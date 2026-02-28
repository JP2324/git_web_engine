import type { CommandHandler, CommandResult } from "../../engine/types";
import { resolvePath, getNode, removeNode } from "../../engine/fileSystem";

const rm: CommandHandler = (state, args): CommandResult => {
    if (args.length === 0) {
        return { state, output: "rm: missing operand" };
    }

    const fileName = args[0];
    const resolved = resolvePath(state.fileSystem, fileName);
    const node = getNode(state.fileSystem, resolved);

    if (!node) {
        return { state, output: `rm: cannot remove '${fileName}': No such file or directory` };
    }

    if (node.type === "directory") {
        return { state, output: `rm: cannot remove '${fileName}': Is a directory` };
    }

    const newFS = removeNode(state.fileSystem, resolved);

    // Also remove from git tracking if tracked/staged
    const newStaged = new Set(state.git.stagedFiles);
    const newTracked = new Set(state.git.trackedFiles);
    newStaged.delete(resolved);
    newTracked.delete(resolved);

    return {
        state: {
            ...state,
            fileSystem: newFS,
            git: {
                ...state.git,
                stagedFiles: newStaged,
                trackedFiles: newTracked,
            },
        },
        output: "",
    };
};

export default rm;
