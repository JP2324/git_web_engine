import type { FileSystemState, DirectoryNode, FileNode, FSNode } from "./types";

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

export function createInitialFileSystem(
    root: DirectoryNode
): FileSystemState {
    return {
        root: structuredClone(root),
        cwd: "/root",
    };
}

// ---------------------------------------------------------------------------
// Path Utilities
// ---------------------------------------------------------------------------

/** Normalize an absolute path: remove trailing slashes, collapse doubles */
function normalizePath(p: string): string {
    const parts = p.split("/").filter(Boolean);
    return "/" + parts.join("/");
}

/**
 * Resolve a potentially relative path against cwd.
 * Returns a normalized absolute path string.
 */
export function resolvePath(fs: FileSystemState, path: string): string {
    if (path === "/") return "/root";

    // Absolute path (starts with /)
    if (path.startsWith("/")) {
        return normalizePath(path);
    }

    // Relative path — resolve against cwd
    const cwdParts = fs.cwd.split("/").filter(Boolean);
    const relParts = path.split("/").filter(Boolean);

    for (const part of relParts) {
        if (part === "..") {
            // Don't go above /root
            if (cwdParts.length > 1) {
                cwdParts.pop();
            }
        } else if (part !== ".") {
            cwdParts.push(part);
        }
    }

    return "/" + cwdParts.join("/");
}

/**
 * Walk the tree to the node at the given absolute path.
 * Path must start with "/root".
 */
export function getNode(fs: FileSystemState, absPath: string): FSNode | null {
    const normalized = normalizePath(absPath);
    const parts = normalized.split("/").filter(Boolean);

    if (parts.length === 0) return null;
    if (parts[0] !== "root") return null;

    let current: FSNode = fs.root;

    for (let i = 1; i < parts.length; i++) {
        if (current.type !== "directory") return null;
        const child: FSNode | undefined = current.children[parts[i]];
        if (!child) return null;
        current = child;
    }

    return current;
}

/**
 * Get the parent directory node and the target name from an absolute path.
 */
function getParentAndName(
    fs: FileSystemState,
    absPath: string
): { parent: DirectoryNode; name: string } | null {
    const normalized = normalizePath(absPath);
    const parts = normalized.split("/").filter(Boolean);

    if (parts.length < 2) return null; // can't modify root itself
    if (parts[0] !== "root") return null;

    const targetName = parts[parts.length - 1];
    const parentPath = "/" + parts.slice(0, -1).join("/");
    const parentNode = getNode(fs, parentPath);

    if (!parentNode || parentNode.type !== "directory") return null;

    return { parent: parentNode, name: targetName };
}

// ---------------------------------------------------------------------------
// Mutations (return new state — never mutate input)
// ---------------------------------------------------------------------------

/** Deep-clone the file system state and apply a mutation function */
function withClonedFS(
    fs: FileSystemState,
    mutate: (cloned: FileSystemState) => void
): FileSystemState {
    const cloned: FileSystemState = {
        root: structuredClone(fs.root),
        cwd: fs.cwd,
    };
    mutate(cloned);
    return cloned;
}

/** Add a file at the given absolute path */
export function addFile(fs: FileSystemState, absPath: string): FileSystemState {
    return withClonedFS(fs, (cloned) => {
        const info = getParentAndName(cloned, absPath);
        if (!info) return;
        if (info.parent.children[info.name]) return; // already exists
        const newFile: FileNode = { type: "file" };
        info.parent.children[info.name] = newFile;
    });
}

/** Add a directory at the given absolute path */
export function addDirectory(
    fs: FileSystemState,
    absPath: string
): FileSystemState {
    return withClonedFS(fs, (cloned) => {
        const info = getParentAndName(cloned, absPath);
        if (!info) return;
        if (info.parent.children[info.name]) return; // already exists
        const newDir: DirectoryNode = { type: "directory", children: {} };
        info.parent.children[info.name] = newDir;
    });
}

/** Remove the node at the given absolute path */
export function removeNode(
    fs: FileSystemState,
    absPath: string
): FileSystemState {
    return withClonedFS(fs, (cloned) => {
        const info = getParentAndName(cloned, absPath);
        if (!info) return;
        delete info.parent.children[info.name];
    });
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/** List immediate children of a directory at the given absolute path */
export function listDirectory(
    fs: FileSystemState,
    absPath: string
): string[] | null {
    const node = getNode(fs, absPath);
    if (!node || node.type !== "directory") return null;

    const dirs: string[] = [];
    const files: string[] = [];

    for (const [name, child] of Object.entries(node.children)) {
        if (child.type === "directory") {
            dirs.push(name + "/");
        } else {
            files.push(name);
        }
    }

    // Directories first, then files — both alphabetical
    dirs.sort();
    files.sort();
    return [...dirs, ...files];
}

/**
 * Recursively collect all file paths under a directory node.
 * Returns absolute paths like "/root/src/index.js".
 */
export function getAllFilePaths(
    node: DirectoryNode,
    prefix: string
): string[] {
    const result: string[] = [];

    for (const [name, child] of Object.entries(node.children)) {
        const childPath = prefix + "/" + name;
        if (child.type === "file") {
            result.push(childPath);
        } else {
            result.push(...getAllFilePaths(child, childPath));
        }
    }

    return result;
}
