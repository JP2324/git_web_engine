import type { CommandHandler, CommandResult } from "../../engine/types";
import { resolvePath, getNode } from "../../engine/fileSystem";

const cd: CommandHandler = (state, args): CommandResult => {
    if (args.length === 0) {
        // cd with no args goes to /root
        return {
            state: {
                ...state,
                fileSystem: { ...state.fileSystem, cwd: "/root" },
            },
            output: "",
        };
    }

    const target = args[0];
    const resolved = resolvePath(state.fileSystem, target);
    const node = getNode(state.fileSystem, resolved);

    if (!node) {
        return { state, output: `cd: no such file or directory: ${target}` };
    }

    if (node.type !== "directory") {
        return { state, output: `cd: not a directory: ${target}` };
    }

    return {
        state: {
            ...state,
            fileSystem: { ...state.fileSystem, cwd: resolved },
        },
        output: "",
    };
};

export default cd;
