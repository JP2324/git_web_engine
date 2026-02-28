import type { EngineState, CommandResult, CommandHandler } from "./types";

// Terminal commands
import ls from "../commands/terminal/ls";
import cd from "../commands/terminal/cd";
import pwd from "../commands/terminal/pwd";
import cat from "../commands/terminal/cat";
import touch from "../commands/terminal/touch";
import mkdir from "../commands/terminal/mkdir";
import rm from "../commands/terminal/rm";
import clear from "../commands/terminal/clear";
import { helpWithCommands } from "../commands/terminal/help";

// Git commands
import gitInit from "../commands/git/gitInit";
import gitAdd from "../commands/git/gitAdd";
import gitCommit from "../commands/git/gitCommit";
import gitStatus from "../commands/git/gitStatus";
import gitLog from "../commands/git/gitLog";

// ---------------------------------------------------------------------------
// Command registry — maps command name → handler
// ---------------------------------------------------------------------------

const COMMAND_REGISTRY: Record<string, CommandHandler> = {
    ls,
    cd,
    pwd,
    cat,
    touch,
    mkdir,
    rm,
    clear,
    "git init": gitInit,
    "git add": gitAdd,
    "git commit": gitCommit,
    "git status": gitStatus,
    "git log": gitLog,
};

// Known git subcommands for distinguishing "not allowed" vs "unknown"
const KNOWN_GIT_SUBCOMMANDS = [
    "init", "add", "commit", "status", "log",
    "branch", "checkout", "merge", "rebase", "reset",
    "stash", "cherry-pick", "tag", "switch", "diff",
    "push", "pull", "fetch", "clone", "remote",
];

// ---------------------------------------------------------------------------
// Input parser
// ---------------------------------------------------------------------------

interface ParsedInput {
    commandKey: string;
    args: string[];
}

/**
 * Parse raw input into a command key and arguments.
 * Git commands have multi-word keys (e.g. "git add").
 */
function parseInput(raw: string): ParsedInput {
    const parts = raw.split(/\s+/).filter(Boolean);

    if (parts.length === 0) {
        return { commandKey: "", args: [] };
    }

    // Handle git subcommands
    if (parts[0] === "git" && parts.length >= 2) {
        const subcommand = parts[1];
        const commandKey = `git ${subcommand}`;
        const args = parts.slice(2);
        return { commandKey, args };
    }

    // Regular terminal commands
    return { commandKey: parts[0], args: parts.slice(1) };
}

// ---------------------------------------------------------------------------
// Dispatcher
// ---------------------------------------------------------------------------

export function dispatch(
    state: EngineState,
    rawInput: string,
    allowedCommands: string[]
): CommandResult {
    const trimmed = rawInput.trim();

    if (trimmed.length === 0) {
        return { state, output: "" };
    }

    // Special case: "help" — uses allowedCommands context
    if (trimmed === "help") {
        if (!allowedCommands.includes("help")) {
            return {
                state,
                output: "This command is not allowed in this exercise.",
            };
        }
        return helpWithCommands(state, [], allowedCommands);
    }

    const { commandKey, args } = parseInput(trimmed);

    // Check if it's a known command
    const handler = COMMAND_REGISTRY[commandKey];

    if (!handler) {
        // Check if it's a known-but-unregistered git command
        if (commandKey.startsWith("git ")) {
            const sub = commandKey.replace("git ", "");
            if (KNOWN_GIT_SUBCOMMANDS.includes(sub)) {
                return {
                    state,
                    output: "This command is not allowed in this exercise.",
                };
            }
        }
        return { state, output: `Unknown command: ${commandKey}` };
    }

    // Check if the command is allowed in this exercise
    // For "git add ." — the allowedCommands check uses "git add"
    const allowedKey = commandKey;

    if (!allowedCommands.includes(allowedKey)) {
        return {
            state,
            output: "This command is not allowed in this exercise.",
        };
    }

    return handler(state, args);
}
