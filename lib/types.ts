export interface Commit {
    id: string;
    message: string;
    parents: string[];
    timestamp: number;
    snapshot: string[];
}

export interface HEAD {
    type: "branch" | "detached";
    ref: string;
}

export interface FileState {
    name: string;
    status: "untracked" | "staged" | "committed";
}

export interface GitState {
    isInitialized: boolean;
    commits: Record<string, Commit>;
    branches: Record<string, string | null>;
    HEAD: HEAD;
    workingDirectory: FileState[];
    stagingArea: string[];
    commitCounter: number;
}

export interface CommandResult {
    newState: GitState;
    output: string;
}

export interface ExerciseConfig {
    id: number;
    title: string;
    initialState: GitState;
    allowedCommands: string[];
    steps: string[];
    successCondition: (state: GitState) => boolean;
}
