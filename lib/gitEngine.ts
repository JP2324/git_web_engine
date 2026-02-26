import type { GitState, CommandResult } from "./types";
import { matchCommand, parseCommitMessage } from "./commandParser";

export function executeCommand(
    state: GitState,
    input: string,
    allowedCommands: string[]
): CommandResult {
    const trimmed = input.trim();

    if (trimmed.length === 0) {
        return { newState: state, output: "" };
    }

    const matched = matchCommand(trimmed);

    if (matched === null) {
        if (trimmed.startsWith("git ")) {
            return { newState: state, output: "Unknown git command." };
        }
        return { newState: state, output: "Invalid command syntax." };
    }

    const commandBase = matched === "git commit" ? "git commit" : matched;
    if (!allowedCommands.includes(commandBase)) {
        return { newState: state, output: "Command not allowed in this exercise." };
    }

    switch (matched) {
        case "ls":
            return executeLs(state);
        case "git init":
            return executeGitInit(state);
        case "git status":
            return executeGitStatus(state);
        case "git add .":
            return executeGitAdd(state);
        case "git commit":
            return executeGitCommit(state, trimmed);
        case "git log":
            return executeGitLog(state);
        default:
            return { newState: state, output: "Unknown git command." };
    }
}

function executeLs(state: GitState): CommandResult {
    const files = state.workingDirectory.map((f) => f.name);
    if (files.length === 0) {
        return { newState: state, output: "No files in working directory." };
    }
    return { newState: state, output: files.join("\n") };
}

function executeGitInit(state: GitState): CommandResult {
    if (state.isInitialized) {
        return { newState: state, output: "Repository already initialized." };
    }

    const newState: GitState = {
        ...state,
        isInitialized: true,
        branches: { ...state.branches, main: null },
        HEAD: { type: "branch", ref: "main" },
    };

    return { newState, output: "Initialized empty Git repository." };
}

function executeGitStatus(state: GitState): CommandResult {
    if (!state.isInitialized) {
        return {
            newState: state,
            output: "Repository not initialized. Run git init first.",
        };
    }

    const currentBranch = state.HEAD.ref;
    const lines: string[] = [`On branch ${currentBranch}`, ""];

    const untrackedFiles = state.workingDirectory.filter(
        (f) => f.status === "untracked"
    );
    const stagedFiles = state.workingDirectory.filter(
        (f) => f.status === "staged"
    );
    const committedFiles = state.workingDirectory.filter(
        (f) => f.status === "committed"
    );

    if (stagedFiles.length > 0) {
        lines.push("Changes to be committed:");
        stagedFiles.forEach((f) => lines.push(`  ${f.name}`));
        lines.push("");
    }

    if (untrackedFiles.length > 0) {
        lines.push("Untracked files:");
        untrackedFiles.forEach((f) => lines.push(`  ${f.name}`));
        lines.push("");
    }

    if (stagedFiles.length === 0 && untrackedFiles.length === 0) {
        if (committedFiles.length > 0) {
            lines.push("nothing to commit, working tree clean");
        } else {
            lines.push("nothing to commit");
        }
    } else if (stagedFiles.length === 0) {
        lines.push("nothing added to commit yet");
    }

    return { newState: state, output: lines.join("\n") };
}

function executeGitAdd(state: GitState): CommandResult {
    if (!state.isInitialized) {
        return {
            newState: state,
            output: "Repository not initialized. Run git init first.",
        };
    }

    const untrackedFiles = state.workingDirectory.filter(
        (f) => f.status === "untracked"
    );

    if (untrackedFiles.length === 0) {
        return { newState: state, output: "No files to add." };
    }

    const newWorkingDirectory = state.workingDirectory.map((f) =>
        f.status === "untracked" ? { ...f, status: "staged" as const } : { ...f }
    );

    const newStagingArea = [
        ...state.stagingArea,
        ...untrackedFiles.map((f) => f.name),
    ];

    const newState: GitState = {
        ...state,
        workingDirectory: newWorkingDirectory,
        stagingArea: newStagingArea,
    };

    return {
        newState,
        output: `${untrackedFiles.length} file${untrackedFiles.length > 1 ? "s" : ""} added to staging area.`,
    };
}

function executeGitCommit(state: GitState, input: string): CommandResult {
    if (!state.isInitialized) {
        return {
            newState: state,
            output: "Repository not initialized. Run git init first.",
        };
    }

    const message = parseCommitMessage(input);
    if (message === null) {
        return {
            newState: state,
            output: 'Invalid command syntax.',
        };
    }

    if (state.stagingArea.length === 0) {
        return {
            newState: state,
            output: "Nothing to commit. Stage files first using git add.",
        };
    }

    const newCounter = state.commitCounter + 1;
    const commitId = `C${newCounter}`;
    const currentBranch = state.HEAD.ref;

    const parentCommitId = state.branches[currentBranch];
    const parents: string[] = parentCommitId ? [parentCommitId] : [];

    const newCommit: import("./types").Commit = {
        id: commitId,
        message,
        parents,
        timestamp: Date.now(),
        snapshot: [...state.stagingArea],
    };

    const newWorkingDirectory = state.workingDirectory.map((f) =>
        f.status === "staged" ? { ...f, status: "committed" as const } : { ...f }
    );

    const newState: GitState = {
        ...state,
        commits: { ...state.commits, [commitId]: newCommit },
        branches: { ...state.branches, [currentBranch]: commitId },
        workingDirectory: newWorkingDirectory,
        stagingArea: [],
        commitCounter: newCounter,
    };

    const fileCount = newCommit.snapshot.length;

    return {
        newState,
        output: `[${currentBranch} ${commitId}] ${message}\n${fileCount} file${fileCount > 1 ? "s" : ""} committed.`,
    };
}

function executeGitLog(state: GitState): CommandResult {
    if (!state.isInitialized) {
        return {
            newState: state,
            output: "Repository not initialized. Run git init first.",
        };
    }

    const commitIds = Object.keys(state.commits);

    if (commitIds.length === 0) {
        return { newState: state, output: "No commits yet." };
    }

    const sortedCommits = commitIds
        .map((id) => state.commits[id])
        .sort((a, b) => b.timestamp - a.timestamp);

    const lines = sortedCommits.map(
        (commit) => `commit ${commit.id}\nMessage: ${commit.message}`
    );

    return { newState: state, output: lines.join("\n\n") };
}
