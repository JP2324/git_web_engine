"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    ReactFlow,
    ReactFlowProvider,
    Handle,
    Position,
    Background,
    BackgroundVariant,
    useReactFlow,
    getSmoothStepPath,
    BaseEdge,
} from "@xyflow/react";
import type { NodeProps, EdgeProps, Node, Edge } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import Navbar from "@/components/navbar";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";

import type { GitState, ExerciseConfig } from "@/lib/types";
import { executeCommand } from "@/lib/gitEngine";
import { deriveGraphFromState } from "@/lib/graphDeriver";

// ---------------------------------------------------------------------------
// Exercise registry
// ---------------------------------------------------------------------------
const exerciseRegistry: Record<number, () => Promise<ExerciseConfig>> = {
    1: async () => {
        const { exercise1Config } = await import(
            "@/exercises/exercise-1/config"
        );
        return exercise1Config;
    },
};

const TOTAL_EXERCISES = 10;

const exerciseLabels: Record<number, string> = {
    1: "Initialize and First Commit",
    2: "Branching Basics",
    3: "Merging Branches",
    4: "Handling Conflicts",
    5: "Rebasing",
    6: "Detached HEAD",
    7: "Cherry Pick",
    8: "Interactive Rebase",
    9: "Stashing Changes",
    10: "Advanced Workflows",
};

// ---------------------------------------------------------------------------
// Custom commit node (same pattern as git-flow-example.tsx)
// ---------------------------------------------------------------------------
function CommitNode({ data }: NodeProps) {
    const isActive = data.isActive as boolean;
    const branches = data.branches as string[] | undefined;
    const message = data.message as string | undefined;

    return (
        <div
            className={[
                "relative flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full border-2 text-xs md:text-sm font-mono shadow-sm transition-all duration-500",
                isActive
                    ? "border-accent bg-gradient-to-br from-accent to-accent-hover text-white shadow-[0_0_20px_rgba(240,80,50,0.5)] z-10 scale-[1.03]"
                    : "border-border/60 bg-surface/80 backdrop-blur-sm text-text-primary z-0 hover:border-border hover:bg-surface",
            ].join(" ")}
        >
            <Handle
                type="target"
                position={Position.Left}
                className="!w-1 !h-1 !opacity-0 !border-none !bg-transparent"
            />
            <span>{data.label as string}</span>
            <Handle
                type="source"
                position={Position.Right}
                className="!w-1 !h-1 !opacity-0 !border-none !bg-transparent"
            />

            {branches && branches.length > 0 && (
                <div className="absolute bottom-[calc(100%+12px)] left-1/2 -translate-x-1/2 flex flex-col-reverse items-center gap-1.5 pointer-events-none z-50">
                    {branches.map((branch: string) => (
                        <span
                            key={branch}
                            className={[
                                "text-[11px] px-2.5 py-0.5 rounded-full whitespace-nowrap border shadow-xl transition-all duration-300 font-sans",
                                isActive
                                    ? "bg-accent/15 text-accent border-accent/40 shadow-[0_0_10px_rgba(240,80,50,0.15)]"
                                    : "border-border/60 bg-surface/90 backdrop-blur-sm text-text-secondary",
                            ].join(" ")}
                        >
                            {branch}
                        </span>
                    ))}
                </div>
            )}

            {message && (
                <div className="absolute -bottom-10 text-xs font-medium text-text-primary whitespace-nowrap pointer-events-none font-sans z-30">
                    {message}
                </div>
            )}
        </div>
    );
}

// ---------------------------------------------------------------------------
// Custom git edge
// ---------------------------------------------------------------------------
function GitEdge({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
    data,
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
                stroke: isActive ? "#F05032" : "#2D3748",
            }}
        />
    );
}

const nodeTypes = { commit: CommitNode };
const edgeTypes = { gitEdge: GitEdge };

// ---------------------------------------------------------------------------
// FlowResizer — keeps diagram fitted inside container
// ---------------------------------------------------------------------------
function FlowResizer({
    wrapperRef,
    nodes,
}: {
    wrapperRef: React.RefObject<HTMLDivElement | null>;
    nodes: Node[];
}) {
    const { fitView } = useReactFlow();

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;
        const resizeObserver = new ResizeObserver(() => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                window.requestAnimationFrame(() => {
                    fitView({ padding: 0.4, minZoom: 0.1, maxZoom: 1.0 });
                });
            }, 40);
        });

        if (wrapperRef.current) {
            resizeObserver.observe(wrapperRef.current);
        }

        return () => {
            clearTimeout(timeoutId);
            resizeObserver.disconnect();
        };
    }, [fitView, wrapperRef]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            window.requestAnimationFrame(() => {
                fitView({ padding: 0.4, minZoom: 0.1, maxZoom: 1.0 });
            });
        }, 60);
        return () => clearTimeout(timeout);
    }, [nodes, fitView]);

    return null;
}

// ---------------------------------------------------------------------------
// Terminal history entry
// ---------------------------------------------------------------------------
interface TerminalEntry {
    input: string;
    output: string;
}

// ---------------------------------------------------------------------------
// Main Page component
// ---------------------------------------------------------------------------
export default function ExercisePage() {
    const params = useParams();
    const router = useRouter();
    const exerciseId = Number(params.exerciseId);

    const [config, setConfig] = useState<ExerciseConfig | null>(null);
    const [gitState, setGitState] = useState<GitState | null>(null);
    const [history, setHistory] = useState<TerminalEntry[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isCompleted, setIsCompleted] = useState(false);

    // Confirmation dialog state
    const [dialogOpen, setDialogOpen] = useState(false);
    const [pendingExerciseId, setPendingExerciseId] = useState<number | null>(
        null
    );

    const terminalEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const flowWrapperRef = useRef<HTMLDivElement>(null);

    // ---- Load exercise config on route change ----
    useEffect(() => {

        const loadExercise = async () => {
            const loader = exerciseRegistry[exerciseId];
            if (!loader) {
                setConfig(null);
                setGitState(null);
                setHistory([]);
                setIsCompleted(false);
                return;
            }

            const exerciseConfig = await loader();
            setConfig(exerciseConfig);
            setGitState(structuredClone(exerciseConfig.initialState));
            setHistory([]);
            setIsCompleted(false);
            setInputValue("");
            window.scrollTo({ top: 0, behavior: "smooth" });
        };

        loadExercise();
    }, [exerciseId]);

    // ---- Terminal auto-scroll ----
    useEffect(() => {
        terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [history]);

    // ---- Success detection ----
    useEffect(() => {
        if (config && gitState && config.successCondition(gitState)) {
            setIsCompleted(true);
        }
    }, [gitState, config]);

    // ---- Derive graph from gitState ----
    const { nodes, edges } = useMemo<{ nodes: Node[]; edges: Edge[] }>(() => {
        if (!gitState) return { nodes: [], edges: [] };
        return deriveGraphFromState(gitState);
    }, [gitState]);

    // ---- Execute terminal command ----
    const handleExecute = useCallback(() => {
        if (!gitState || !config) return;
        const trimmed = inputValue.trim();
        if (trimmed.length === 0) return;

        const result = executeCommand(gitState, trimmed, config.allowedCommands);
        setGitState(result.newState);
        setHistory((prev) => [...prev, { input: trimmed, output: result.output }]);
        setInputValue("");
    }, [gitState, config, inputValue]);

    // ---- Dropdown logic ----
    const handleExerciseSelect = useCallback(
        (value: string) => {
            const selectedId = Number(value);
            if (selectedId === exerciseId) return;

            setPendingExerciseId(selectedId);
            setDialogOpen(true);
        },
        [exerciseId]
    );

    const confirmSwitch = useCallback(() => {
        if (pendingExerciseId !== null) {
            router.push(`/learn/${pendingExerciseId}`);
        }
        setDialogOpen(false);
        setPendingExerciseId(null);
    }, [pendingExerciseId, router]);

    const cancelSwitch = useCallback(() => {
        setDialogOpen(false);
        setPendingExerciseId(null);
    }, []);

    // ---- Not-implemented exercise placeholder ----
    const isImplemented = exerciseId in exerciseRegistry;

    return (
        <div className="min-h-screen bg-background overflow-x-hidden">
            <Navbar />

            {/* Confirmation dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="bg-surface border-border text-text-primary">
                    <DialogHeader>
                        <DialogTitle>Switch Exercise?</DialogTitle>
                        <DialogDescription className="text-text-secondary">
                            Your current progress will be lost. Are you sure you want to
                            switch to Exercise {pendingExerciseId}?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <button
                            onClick={cancelSwitch}
                            className="px-4 py-2 text-sm rounded-md border border-border text-text-secondary hover:text-text-primary hover:bg-muted-surface transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={confirmSwitch}
                            className="px-4 py-2 text-sm rounded-md bg-accent text-white hover:bg-accent-hover transition-colors"
                        >
                            Confirm
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Main content — same wrapper pattern as landing page */}
            <main className="relative pt-28 pb-16 animate-page-enter">
                {/* Background glow — matches hero section */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px]" />
                    <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] bg-accent/3 rounded-full blur-[100px]" />
                </div>

                <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                    {!isImplemented ? (
                        /* Placeholder for unimplemented exercises */
                        <div className="flex items-center justify-center h-[60vh]">
                            <div className="text-center space-y-3">
                                <p className="text-2xl font-semibold text-text-primary">
                                    Exercise {exerciseId}: {exerciseLabels[exerciseId] ?? "Unknown"}
                                </p>
                                <p className="text-text-secondary">
                                    Coming soon! This exercise is not yet implemented.
                                </p>
                            </div>
                        </div>
                    ) : (
                        /* Two-column grid — 420px left, flex right */
                        <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-6 lg:h-[calc(100vh-160px)]">
                            {/* ───── LEFT COLUMN: Exercise Info ───── */}
                            <div className="order-1 lg:order-1">
                                <div className="rounded-2xl border border-border bg-surface/80 backdrop-blur-sm p-5 space-y-5 shadow-2xl shadow-black/10 transition-all duration-200 hover:shadow-[0_8px_30px_rgba(0,0,0,0.2)] hover:border-accent/20 lg:max-h-[calc(100vh-160px)] lg:overflow-y-auto no-scrollbar">
                                    {/* Exercise dropdown — top of card */}
                                    <div className="mb-3">
                                        <Select
                                            value={String(exerciseId)}
                                            onValueChange={handleExerciseSelect}
                                        >
                                            <SelectTrigger className="w-full bg-muted-surface/50 border-border text-text-primary rounded-xl focus:ring-1 focus:ring-accent/50">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-surface border-border">
                                                {Array.from(
                                                    { length: TOTAL_EXERCISES },
                                                    (_, i) => i + 1
                                                ).map((id) => (
                                                    <SelectItem
                                                        key={id}
                                                        value={String(id)}
                                                        className="text-text-primary hover:bg-muted-surface focus:bg-muted-surface focus:text-text-primary"
                                                    >
                                                        Exercise {id}: {exerciseLabels[id]}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Title + success badge */}
                                    <div className="space-y-3">
                                        <h1 className="text-2xl lg:text-3xl font-bold text-text-primary leading-tight">
                                            {config?.title}
                                        </h1>
                                        {isCompleted && (
                                            <div className="inline-flex items-center gap-1.5 text-sm font-medium text-green-400 bg-green-400/10 border border-green-400/20 px-3 py-1.5 rounded-full animate-badge-pop">
                                                ✅ Exercise Completed
                                            </div>
                                        )}
                                    </div>

                                    {/* Step-by-step guide */}
                                    {config?.steps && config.steps.length > 0 && (
                                        <div className="rounded-xl bg-muted-surface/40 border-l-2 border-accent/60 p-4 space-y-2.5">
                                            <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider">
                                                Steps to Complete
                                            </h3>
                                            <ol className="list-decimal pl-5 space-y-2 text-sm text-text-secondary leading-relaxed">
                                                {config.steps.map((step, idx) => (
                                                    <li key={idx}>{step}</li>
                                                ))}
                                            </ol>
                                        </div>
                                    )}

                                    {/* Allowed commands */}
                                    <div className="space-y-2">
                                        <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                                            Allowed Commands
                                        </h2>
                                        <div className="flex flex-wrap gap-1.5">
                                            {config?.allowedCommands.map((cmd) => (
                                                <code
                                                    key={cmd}
                                                    className="text-xs bg-muted-surface text-accent px-2 py-1 rounded-md border border-border/60 font-mono"
                                                >
                                                    {cmd}
                                                </code>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Goal */}
                                    <div className="space-y-1.5">
                                        <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                                            Goal
                                        </h2>
                                        <p className="text-sm text-text-secondary leading-relaxed">
                                            Initialize a Git repository and make your first commit
                                            with the files in your working directory.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* ───── RIGHT COLUMN: Graph + Terminal ───── */}
                            <div className="flex flex-col gap-4 order-2 lg:order-2 lg:h-full lg:min-h-0">
                                {/* React Flow container */}
                                <div
                                    ref={flowWrapperRef}
                                    className={[
                                        "w-full rounded-2xl border border-border bg-surface/50 overflow-hidden shadow-[inset_0_2px_20px_rgba(0,0,0,0.15)] relative transition-opacity duration-300",
                                        "h-[280px] sm:h-[320px] lg:flex-1 lg:min-h-0",
                                        nodes.length > 0 ? "opacity-100" : "opacity-100",
                                    ].join(" ")}
                                >
                                    <ReactFlowProvider>
                                        <FlowResizer wrapperRef={flowWrapperRef} nodes={nodes} />
                                        <ReactFlow
                                            nodes={nodes}
                                            edges={edges}
                                            nodeTypes={nodeTypes}
                                            edgeTypes={edgeTypes}
                                            fitView
                                            fitViewOptions={{
                                                padding: 0.4,
                                                minZoom: 0.1,
                                                maxZoom: 1.0,
                                            }}
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
                                            <Background
                                                variant={BackgroundVariant.Dots}
                                                gap={24}
                                                size={1.5}
                                                color="#9CA3AF"
                                                className="opacity-15"
                                            />
                                        </ReactFlow>
                                    </ReactFlowProvider>

                                    {/* Empty state — centered, improved contrast */}
                                    {nodes.length === 0 && (
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <p className="text-sm text-gray-400 font-mono text-center px-4">
                                                No commits yet — run git init and commit to see the graph
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Terminal */}
                                <div className="rounded-2xl border border-border bg-[#0d1117] overflow-hidden shadow-[inset_0_1px_12px_rgba(0,0,0,0.2)] lg:flex-1 lg:min-h-0 lg:flex lg:flex-col">
                                    <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-surface/40">
                                        <div className="flex gap-1.5">
                                            <span className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                                            <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                                            <span className="w-3 h-3 rounded-full bg-[#27c93f]" />
                                        </div>
                                        <span className="text-xs text-text-secondary font-mono ml-2">
                                            terminal
                                        </span>
                                    </div>

                                    <div
                                        className="h-[260px] sm:h-[300px] lg:h-auto lg:flex-1 overflow-y-auto p-4 font-mono text-sm space-y-3 no-scrollbar"
                                        onClick={() => inputRef.current?.focus()}
                                    >
                                        {/* Welcome message */}
                                        {history.length === 0 && (
                                            <div className="text-text-secondary/60 text-xs">
                                                Type a command and press Enter. Try{" "}
                                                <span className="text-accent">ls</span> or{" "}
                                                <span className="text-accent">git init</span>
                                            </div>
                                        )}

                                        {/* History — each line animates in */}
                                        {history.map((entry, idx) => (
                                            <div key={idx} className="space-y-1 animate-line-enter">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-accent select-none">$</span>
                                                    <span className="text-text-primary">
                                                        {entry.input}
                                                    </span>
                                                </div>
                                                {entry.output && (
                                                    <pre className="text-text-secondary whitespace-pre-wrap pl-5 text-[13px] leading-relaxed">
                                                        {entry.output}
                                                    </pre>
                                                )}
                                            </div>
                                        ))}

                                        {/* Input line */}
                                        <div className="flex items-center gap-2">
                                            <span className="text-accent select-none">$</span>
                                            <input
                                                ref={inputRef}
                                                type="text"
                                                value={inputValue}
                                                onChange={(e) => setInputValue(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") {
                                                        handleExecute();
                                                    }
                                                }}
                                                className="flex-1 bg-transparent text-text-primary outline-none font-mono text-sm caret-accent"
                                                spellCheck={false}
                                                autoComplete="off"
                                                autoFocus
                                            />
                                        </div>
                                        <div ref={terminalEndRef} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
