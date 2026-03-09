import type { GitState } from "./engine/types";
import type { Node, Edge } from "@xyflow/react";

const NODE_SPACING_X = 160;
const LANE_SPACING_Y = 120;

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

    const depths: Record<string, number> = {};
    const lanes: Record<string, number> = {};
    const parentChildrenCount: Record<string, number> = {};
    let nextAvailableLane = 0;

    for (const commit of sortedCommits) {
        if (commit.parents.length === 0) {
            depths[commit.id] = 0;
            lanes[commit.id] = nextAvailableLane;
            nextAvailableLane++;
        } else {
            const parentId = commit.parents[0];
            depths[commit.id] = (depths[parentId] ?? 0) + 1;

            parentChildrenCount[parentId] = (parentChildrenCount[parentId] ?? 0) + 1;

            if (parentChildrenCount[parentId] === 1) {
                lanes[commit.id] = lanes[parentId] ?? 0;
            } else {
                lanes[commit.id] = nextAvailableLane;
                nextAvailableLane++;
            }
        }
    }

    const nodes: Node[] = sortedCommits.map((commit) => ({
        id: commit.id,
        type: "commit",
        position: {
            x: (depths[commit.id] ?? 0) * NODE_SPACING_X,
            y: (lanes[commit.id] ?? 0) * LANE_SPACING_Y,
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
