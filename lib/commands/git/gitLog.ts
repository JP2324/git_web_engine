import type { CommandHandler, CommandResult, Commit } from "../../engine/types";

const NOT_A_REPO =
    "fatal: not a git repository (or any of the parent directories): .git";

const gitLog: CommandHandler = (state, _args): CommandResult => {
    if (!state.git.isInitialized) {
        return { state, output: NOT_A_REPO };
    }

    const currentBranch = state.git.currentBranch;
    const currentTipId = state.git.branches[currentBranch];

    if (!currentTipId) {
        return { state, output: "No commits yet." };
    }

    const commitMap = new Map<string, Commit>();
    for (const c of state.git.commits) {
        commitMap.set(c.id, c);
    }

    const reachableCommits: Commit[] = [];
    const visited = new Set<string>();
    const queue: string[] = [currentTipId];

    while (queue.length > 0) {
        const id = queue.shift()!;
        
        if (visited.has(id)) continue;
        visited.add(id);

        const commit = commitMap.get(id);
        if (commit) {
            reachableCommits.push(commit);
            for (const parentId of commit.parents) {
                if (!visited.has(parentId) && !queue.includes(parentId)) {
                    queue.push(parentId);
                }
            }
        }
    }

    if (reachableCommits.length === 0) {
        return { state, output: "No commits yet." };
    }

    const lines = reachableCommits.map(
        (commit) => `commit ${commit.id}\nMessage: ${commit.message}`
    );

    return { state, output: lines.join("\n\n") };
};

export default gitLog;
