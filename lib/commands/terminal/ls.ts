import type { CommandHandler, CommandResult } from "../../engine/types";
import { listDirectory } from "../../engine/fileSystem";

const ls: CommandHandler = (state, _args): CommandResult => {
    const entries = listDirectory(state.fileSystem, state.fileSystem.cwd);

    if (!entries || entries.length === 0) {
        return { state, output: "(empty directory)" };
    }

    return { state, output: entries.join("  ") };
};

export default ls;
