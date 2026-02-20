"use client";

import * as React from 'react';
import {
    ReactFlow,
    ReactFlowProvider,
    Handle,
    Position,
    NodeProps,
    EdgeProps,
    getSmoothStepPath,
    BaseEdge,
    Background,
    BackgroundVariant,
    useReactFlow
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Badge, cn } from './docs-ui';

// Custom Node for Git Commit
function CommitNode({ data }: NodeProps) {
    const isActive = data.isActive as boolean;
    const branches = data.branches as string[] | undefined;
    const message = data.message as string | undefined;

    return (
        <div className={cn(
            "relative flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full border-2 text-xs md:text-sm font-mono shadow-sm transition-all duration-500",
            isActive ? "border-accent bg-gradient-to-br from-accent to-accent-hover text-white shadow-[0_0_20px_rgba(240,80,50,0.5)] md:shadow-[0_0_24px_rgba(240,80,50,0.6)] z-10 scale-[1.03]"
                : "border-border/60 bg-surface/80 backdrop-blur-sm text-text-primary z-0 hover:border-border hover:bg-surface",
            message?.includes("Merge commit") ? "ring-2 ring-accent/30 ring-offset-2 ring-offset-background" : ""
        )}>
            {/* Target handle for incoming edges */}
            <Handle type="target" position={Position.Left} className="!w-1 !h-1 !opacity-0 !border-none !bg-transparent" />

            <span>{data.label as string}</span>

            {/* Source handle for outgoing edges */}
            <Handle type="source" position={Position.Right} className="!w-1 !h-1 !opacity-0 !border-none !bg-transparent" />

            {/* Branch Labels (Floating above node, stacking upwards to prevent overlap) */}
            {branches && branches.length > 0 && (
                <div className="absolute bottom-[calc(100%+12px)] left-1/2 -translate-x-1/2 flex flex-col-reverse items-center gap-1.5 pointer-events-none z-50">
                    {branches.map((branch: string) => (
                        <Badge key={branch} variant={isActive ? "default" : "secondary"} className={cn("text-[11px] px-2.5 py-0.5 whitespace-nowrap border shadow-xl transition-all duration-300", isActive ? "bg-accent/15 text-accent border-accent/40 shadow-[0_0_10px_rgba(240,80,50,0.15)] ring-1 ring-accent/20" : "border-border/60 bg-surface/90 backdrop-blur-sm")}>
                            {branch}
                        </Badge>
                    ))}
                </div>
            )}

            {/* Commit Message (Floating below node) */}
            {message && (
                <div className="absolute -bottom-10 text-xs font-medium text-text-primary whitespace-nowrap pointer-events-none font-sans z-30">
                    {message}
                </div>
            )}
        </div>
    );
}

// Custom Edge
function GitEdge({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
    data
}: EdgeProps) {
    const [edgePath] = getSmoothStepPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
        borderRadius: 16,
    });

    const isActive = data?.isActive as boolean;

    return (
        <BaseEdge
            path={edgePath}
            markerEnd={markerEnd}
            style={{
                ...style,
                strokeWidth: 2,
                stroke: isActive ? '#F05032' : '#2D3748',
            }}
        />
    );
}

const nodeTypes = {
    commit: CommitNode,
};

const edgeTypes = {
    gitEdge: GitEdge,
};

import type { Node, Edge } from "@xyflow/react";

export interface GitFlowExampleProps {
    nodes: Node[];
    edges: Edge[];
    className?: string;
}

// Resize listener component
function FlowResizer() {
    const { fitView } = useReactFlow();

    React.useEffect(() => {
        const resizeObserver = new ResizeObserver(() => {
            window.requestAnimationFrame(() => {
                fitView({ padding: 0.25, minZoom: 0.5, maxZoom: 1.2 });
            });
        });

        // Observe the closest parent that dictates width
        const flowEl = document.querySelector('.react-flow');
        if (flowEl) {
            resizeObserver.observe(flowEl);
        }

        return () => resizeObserver.disconnect();
    }, [fitView]);

    return null;
}

// Main wrapper
export function GitFlowExample({ nodes, edges, className }: GitFlowExampleProps) {
    return (
        <div className={cn("w-full h-[280px] md:h-[360px] lg:h-[400px] xl:h-[440px] bg-surface/50 rounded-2xl border border-border/40 overflow-hidden shadow-[inset_0_2px_20px_rgba(0,0,0,0.15)] relative", className)}>
            <ReactFlowProvider>
                <FlowResizer />
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    nodeTypes={nodeTypes}
                    edgeTypes={edgeTypes}
                    fitView
                    fitViewOptions={{ padding: 0.25, minZoom: 0.5, maxZoom: 1.2 }}
                    panOnDrag={false}
                    panOnScroll={false}
                    zoomOnScroll={false}
                    zoomOnDoubleClick={false}
                    zoomOnPinch={false}
                    nodesDraggable={false}
                    nodesConnectable={false}
                    elementsSelectable={false}
                    proOptions={{ hideAttribution: true }}
                >
                    <Background variant={BackgroundVariant.Dots} gap={24} size={1.5} color="#9CA3AF" className="opacity-15" />
                </ReactFlow>
            </ReactFlowProvider>
        </div>
    );
}
