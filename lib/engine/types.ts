// ---------------------------------------------------------------------------
// File System Types
// ---------------------------------------------------------------------------

export interface FileNode {
    type: "file";
}

export interface DirectoryNode {
    type: "directory";
    children: Record<string, FileNode | DirectoryNode>;
}

export type FSNode = FileNode | DirectoryNode;

export interface FileSystemState {
    root: DirectoryNode;
    cwd: string; // absolute path, e.g. "/root"
}

// ---------------------------------------------------------------------------
// Git Types
// ---------------------------------------------------------------------------

export interface Commit {
    id: string;
    message: string;
    parents: string[];
    timestamp: number;
    snapshot: string[]; // file paths included in this commit
}

export interface GitState {
    isInitialized: boolean;
    currentBranch: string;
    commits: Commit[];
    stagedFiles: Set<string>;   // absolute file paths
    trackedFiles: Set<string>;  // absolute file paths
    branches: Record<string, string | null>; // branch → commit id
    commitCounter: number;
}

// ---------------------------------------------------------------------------
// Combined Engine State
// ---------------------------------------------------------------------------

export interface EngineState {
    fileSystem: FileSystemState;
    git: GitState;
}

// ---------------------------------------------------------------------------
// Command Types
// ---------------------------------------------------------------------------

export interface CommandResult {
    state: EngineState;
    output: string;
    clearTerminal?: boolean;
}

export type CommandHandler = (
    state: EngineState,
    args: string[]
) => CommandResult;

// ---------------------------------------------------------------------------
// Exercise Config
// ---------------------------------------------------------------------------

export interface ExerciseConfig {
    id: number;
    title: string;
    initialFileStructure: DirectoryNode;
    allowedCommands: string[];
    steps: string[];
    goal?: string;
    successCondition: (state: EngineState) => boolean;
}
