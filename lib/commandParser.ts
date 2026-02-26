export interface ParsedCommand {
    base: string;
    args: string[];
    raw: string;
}

const VALID_COMMANDS: Record<string, RegExp> = {
    "ls": /^ls$/,
    "git init": /^git init$/,
    "git status": /^git status$/,
    "git add .": /^git add \.$/,
    "git commit": /^git commit -m "(.*)"$/,
    "git log": /^git log$/,
};

export function parseCommand(input: string): ParsedCommand | null {
    const trimmed = input.trim();

    if (trimmed.length === 0) {
        return null;
    }

    return {
        base: trimmed,
        args: trimmed.split(/\s+/),
        raw: trimmed,
    };
}

export function matchCommand(input: string): string | null {
    const trimmed = input.trim();

    for (const [command, pattern] of Object.entries(VALID_COMMANDS)) {
        if (pattern.test(trimmed)) {
            return command;
        }
    }

    return null;
}

export function parseCommitMessage(input: string): string | null {
    const match = input.trim().match(/^git commit -m "(.+)"$/);
    if (match) {
        return match[1];
    }
    return null;
}
