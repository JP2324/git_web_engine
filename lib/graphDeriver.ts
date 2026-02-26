import type { GitState } from "./types";
import type { Node, Edge } from "@xyflow/react";

const NODE_SPACING_X = 160;
const NODE_Y = 100;

export function deriveGraphFromState(state: GitState): {
    nodes: Node[];
    edges: Edge[];
} {
    if (!state.isInitialized || Object.keys(state.commits).length === 0) {
        return { nodes: [], edges: [] };
    }

    const commitIds = Object.keys(state.commits);
    const sortedCommits = commitIds
        .map((id) => state.commits[id])
        .sort((a, b) => a.timestamp - b.timestamp);

    const branchPointers: Record<string, string[]> = {};
    for (const [branchName, commitId] of Object.entries(state.branches)) {
        if (commitId !== null) {
            if (!branchPointers[commitId]) {
                branchPointers[commitId] = [];
            }
            branchPointers[commitId].push(branchName);
        }
    }

    const isHEAD = (commitId: string): boolean => {
        if (state.HEAD.type === "branch") {
            return state.branches[state.HEAD.ref] === commitId;
        }
        return state.HEAD.ref === commitId;
    };

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
