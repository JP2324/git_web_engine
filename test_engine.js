import { createInitialFileSystem, addFile } from './lib/engine/fileSystem.js';
import { createInitialGitState } from './lib/engine/gitState.js';
import gitAdd from './lib/commands/git/gitAdd.js';
import gitCommit from './lib/commands/git/gitCommit.js';
import gitCheckout from './lib/commands/git/gitCheckout.js';
import gitStatus from './lib/commands/git/gitStatus.js';

let state = {
    fileSystem: createInitialFileSystem({ type: "directory", children: {} }),
    git: createInitialGitState()
};

state.git.isInitialized = true;
state.git.currentBranch = "main";
state.git.branches["main"] = null;

// touch app.js
state.fileSystem = addFile(state.fileSystem, "/root/app.js");

state = gitAdd(state, ["."]).state;
state = gitCommit(state, ["-m", "init"]).state;

console.log("Tracked files:", state.git.trackedFiles);

// touch new.js
state.fileSystem = addFile(state.fileSystem, "/root/new.js");

state = gitCheckout(state, ["feature"]).state;

console.log("Tracked files after checkout:", state.git.trackedFiles);
console.log("Staged files after checkout:", state.git.stagedFiles);

let status = gitStatus(state, []);
console.log(status.output);
