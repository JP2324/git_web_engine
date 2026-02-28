import type { GitState } from "./engine/types";
import type { Node, Edge } from "@xyflow/react";

const NODE_SPACING_X = 160;
const NODE_Y = 100;

export function deriveGraphFromState(gitState: GitState): {
    nodes: Node[];
    edges: Edge[];
} {
    if (!gitState.isInitialized || gitState.commits.length === 0) {
        return { nodes: [], edges: [] };
    }

    // Sort commits by timestamp (oldest first for left-to-right layout)
    const sortedCommits = [...gitState.commits].sort(
        (a, b) => a.timestamp - b.timestamp
    );

    // Build branch pointer map: commitId → branch names
    const branchPointers: Record<string, string[]> = {};
    for (const [branchName, commitId] of Object.entries(gitState.branches)) {
        if (commitId !== null) {
            if (!branchPointers[commitId]) {
                branchPointers[commitId] = [];
            }
            branchPointers[commitId].push(branchName);
        }
    }

    // Determine which commit HEAD points to
    const headCommitId = gitState.branches[gitState.currentBranch] ?? null;
    const isHEAD = (commitId: string): boolean => commitId === headCommitId;

    const nodes: Node[] = sortedCommits.map((commit, index) => ({
        id: commit.id,
        type: "commit",
        position: {
            x: index * NODE_SPACING_X,
            y: NODE_Y,
        },
        data: {
            label: commit.id,
            message: commit.message,
            isActive: isHEAD(commit.id),
            branches: branchPointers[commit.id] || [],
        },
    }));

    const edges: Edge[] = [];
    for (const commit of sortedCommits) {
        for (const parentId of commit.parents) {
            edges.push({
                id: `${parentId}-${commit.id}`,
                source: parentId,
                target: commit.id,
                type: "gitEdge",
                data: {
                    isActive:
                        isHEAD(commit.id) || isHEAD(parentId),
                },
            });
        }
    }

    return { nodes, edges };
}
