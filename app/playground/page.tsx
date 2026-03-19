"use client";

import React, { useState } from "react";
import Navbar from "@/components/navbar";
import { 
  Folder, 
  FileText, 
  ChevronDown, 
  ChevronRight, 
  GitBranch, 
  GitCommit,
  Clock, 
  RotateCcw 
} from "lucide-react";
import type { EngineState, FSNode, DirectoryNode } from "@/lib/engine/types";
import { createInitialFileSystem } from "@/lib/engine/fileSystem";
import { createInitialGitState } from "@/lib/engine/gitState";
import { dispatch } from "@/lib/engine/commandDispatcher";
import { deriveGraphFromState } from "@/lib/graphDeriver";
import { 
  ReactFlowProvider, 
  ReactFlow, 
  Controls, 
  useReactFlow,
  Handle,
  Position,
  BaseEdge,
  getSmoothStepPath
} from "@xyflow/react";
import type { Node, NodeProps, EdgeProps } from "@xyflow/react";
import '@xyflow/react/dist/style.css';

function EmptyGraphIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="9" r="4.5" fill="#555a6e" stroke="#1f2330" strokeWidth="2" />
      <circle cx="16" cy="23" r="4.5" fill="#555a6e" stroke="#1f2330" strokeWidth="2" />
      <path d="M16 13.5V18.5" stroke="#1f2330" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function PlaygroundFileTreeNode({ name, node, depth = 0 }: { name: string; node: FSNode; depth?: number }) {
  const [isOpen, setIsOpen] = useState(true);

  if (node.type === "file") {
    return (
      <div 
        className="flex items-center gap-1.5 text-xs font-mono py-0.5 text-[#555a6e]"
        style={{ paddingLeft: `${(depth + 1) * 16}px` }}
      >
        <FileText size={14} className="shrink-0" />
        <span>{name}</span>
      </div>
    );
  }

  const dir = node as DirectoryNode;
  const entries = Object.entries(dir.children);
  const sorted = entries.sort(([aName, aNode], [bName, bNode]) => {
    if (aNode.type === bNode.type) return aName.localeCompare(bName);
    return aNode.type === "directory" ? -1 : 1;
  });

  return (
    <div className="flex flex-col gap-0.5">
      <div 
        className="flex items-center gap-1.5 text-xs font-mono py-0.5 text-[#8b90a0] cursor-pointer"
        style={{ paddingLeft: `${(depth + 1) * 16}px` }}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <ChevronDown size={14} className="shrink-0" /> : <ChevronRight size={14} className="shrink-0" />}
        <Folder size={14} className="shrink-0 text-[#e8eaf0] fill-[#e8eaf0]/20" />
        <span className="select-none">{name}/</span>
      </div>
      {isOpen && (
        <div className="flex flex-col gap-0.5">
          {sorted.map(([childName, childNode]) => (
            <PlaygroundFileTreeNode
              key={childName}
              name={childName}
              node={childNode}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

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

function PlaygroundFlowResizer({ nodes }: { nodes: Node[] }) {
  const { fitView } = useReactFlow();
  const prevNodesLength = React.useRef(nodes.length);

  React.useEffect(() => {
    if (nodes.length > 0 && nodes.length > prevNodesLength.current) {
      setTimeout(() => {
        window.requestAnimationFrame(() => {
          fitView({ duration: 350, padding: 0.2, minZoom: 0.5, maxZoom: 1.5 });
        });
      }, 50);
    }
    prevNodesLength.current = nodes.length;
  }, [nodes.length, fitView]);

  return null;
}

type TabKey = 'basics' | 'branching' | 'history';

const cheatsheetTabs: Record<TabKey, Array<{ cmd: string; desc: string }>> = {
  basics: [
    { cmd: "git init", desc: "Initialize a new repository" },
    { cmd: "git status", desc: "Show working tree status" },
    { cmd: "git add", desc: "Stage files" },
    { cmd: 'git commit', desc: "Commit staged changes" },
  ],
  branching: [
    { cmd: "git branch", desc: "List or create branches" },
    { cmd: "git checkout", desc: "Switch or construct branches" },
    { cmd: "git merge", desc: "Merge into current branch" },
  ],
  history: [
    { cmd: "git log", desc: "Full or grouped history" },
    { cmd: "git reset", desc: "Undo commits" },
    { cmd: "git revert", desc: "Safe undo" },
    { cmd: "git rebase", desc: "Reapply commits on new tip" },
  ],
};

const ALLOWED_COMMANDS = [
  "ls", "cd", "pwd", "cat", "touch", "mkdir", "rm", "clear", "help",
  "git init", "git add", "git commit", "git status", "git log", 
  "git branch", "git checkout", "git merge", "git reset", "git revert", "git rebase"
];

function buildInitialState(): EngineState {
  return {
    fileSystem: createInitialFileSystem({
      type: "directory",
      children: {
        "app.js": { type: "file" },
        "index.js": { type: "file" },
        "utils.js": { type: "file" }
      }
    }),
    git: createInitialGitState()
  };
}

export default function PlaygroundPage() {
  const [isCheatsheetOpen, setIsCheatsheetOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('basics');
  const [isFolderOpen, setIsFolderOpen] = useState(true);

  // Engine State
  const [engineState, setEngineState] = useState<EngineState>(buildInitialState);
  
  // Terminal State
  const [inputValue, setInputValue] = useState("");
  const [history, setHistory] = useState<{ input: string; output: string }[]>([]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [sessionHistory, setSessionHistory] = useState<Array<{ time: string; command: string; isGit: boolean }>>([]);
  
  const [activePopover, setActivePopover] = useState<'repo' | 'files' | 'history' | null>(null);
  
  const terminalEndRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const sidebarRef = React.useRef<HTMLDivElement>(null);

  // Terminal auto-scroll
  React.useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  // Handle click outside for popovers
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as globalThis.Node | null)) {
        setActivePopover(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle responsive Quick Reference closing
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsCheatsheetOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    // Initial check
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Derived Values
  const { nodes, edges } = React.useMemo(() => {
    return deriveGraphFromState(engineState.git);
  }, [engineState]);

  const promptPath = React.useMemo(() => {
    const cwd = engineState.fileSystem.cwd;
    return cwd === "/root" ? "~" : "~" + cwd.replace("/root", "");
  }, [engineState]);

  const handleFocusClick = () => {
    inputRef.current?.focus();
  };

  const handleExecute = () => {
    const trimmed = inputValue.trim();
    if (trimmed.length === 0) return;

    const result = dispatch(engineState, trimmed, ALLOWED_COMMANDS);
    setEngineState(result.state);

    if (result.clearTerminal) {
      setHistory([]);
    } else {
      setHistory(prev => [...prev, { input: trimmed, output: result.output }]);
    }
    
    // Add to session history
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    setSessionHistory(prev => [
      { time: timeStr, command: trimmed, isGit: trimmed.startsWith('git ') },
      ...prev
    ]);

    setCommandHistory(prev => [...prev, trimmed]);
    setHistoryIndex(-1);
    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleExecute();
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (commandHistory.length === 0) return;
      const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(newIndex);
      setInputValue(commandHistory[newIndex]);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex === -1) return;
      if (historyIndex >= commandHistory.length - 1) {
        setHistoryIndex(-1);
        setInputValue("");
      } else {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setInputValue(commandHistory[newIndex]);
      }
    }
  };

  const handleReset = () => {
    setEngineState(buildInitialState());
    setHistory([]);
    setCommandHistory([]);
    setSessionHistory([]);
    setInputValue("");
    setHistoryIndex(-1);
  };

  return (
    <div className="min-h-screen lg:h-screen bg-[#0d0f14] flex flex-col overflow-x-hidden lg:overflow-hidden">
      <Navbar />
      
      <main className="flex-1 w-full pt-28 pb-6 max-[480px]:px-0 max-[480px]:gap-2 px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-4 lg:gap-6 min-h-0 lg:overflow-hidden">
      
      {/* 
        ========================================
        LEFT PANEL (Sidebar)
        ========================================
      */}
      <div 
        ref={sidebarRef}
        className="
        order-3 lg:order-1 
        w-full lg:w-[56px] xl:w-[22%] 
        h-auto lg:h-full 
        bg-[#13161e] rounded-xl max-[480px]:rounded-none border max-[480px]:border-x-0 border-[#1f2330] 
        flex flex-col overflow-[visible_!important] xl:overflow-hidden shadow-lg lg:min-h-0 relative
      ">
        {/* Mobile Summary Strip (< 1024px) */}
        <div className="flex lg:hidden items-center justify-between w-full px-4 py-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${engineState.git.isInitialized ? 'bg-[#28c840]' : 'bg-[#555a6e]'}`} />
              <GitBranch size={16} className="text-[#555a6e]" />
              <span className="text-xs font-mono text-[#555a6e]">
                {engineState.git.isInitialized ? (engineState.git.currentBranch || "—") : "not initialized"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <GitCommit size={16} className="text-[#555a6e]" />
              <span className="text-xs font-mono text-[#8b90a0]">{engineState.git.commits.length} commits</span>
            </div>
          </div>
          <button onClick={handleReset} className="text-xs font-medium text-[#555a6e] hover:text-[#e8572a] transition-colors ml-4">
            Reset
          </button>
        </div>

        {/* Desktop Content (>= 1024px) */}
        <div className="hidden lg:flex flex-col h-full w-full">
          
          {/* Section 1 - Identity */}
          <div className="px-2 xl:px-4 py-4 xl:pt-5 xl:pb-4 border-b border-[#1f2330] flex flex-col items-center xl:items-start shrink-0">
            <div className="hidden xl:block w-full">
              <span className="inline-block mb-2 bg-[rgba(232,87,42,0.15)] text-[#e8572a] border border-[#e8572a]/30 rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-widest uppercase">
                Sandbox
              </span>
              <h1 className="text-lg font-bold text-[#e8eaf0]">Git Playground</h1>
              <p className="mt-1 text-xs text-[#555a6e] leading-relaxed">Free-form sandbox. No steps, no rules.</p>
              <button onClick={handleReset} className="mt-3 w-full text-xs font-medium py-1.5 rounded-lg border border-[#1f2330] text-[#8b90a0] hover:text-[#e8572a] hover:border-[#e8572a]/40 bg-[#1a1d27] hover:bg-[rgba(232,87,42,0.05)] transition-all duration-150">
                Reset Sandbox
              </button>
            </div>
            <div className="xl:hidden w-full flex justify-center">
              <button onClick={handleReset} className="text-[#555a6e] hover:text-[#e8eaf0] transition-colors p-1" title="Reset Sandbox">
                <RotateCcw size={20} />
              </button>
            </div>
          </div>

          {/* Section 2 - Repo State */}
          <div className="px-2 xl:px-4 py-4 border-b border-[#1f2330] flex flex-col items-center xl:items-start shrink-0">
            <div className="hidden xl:block w-full">
              <h2 className="text-xs font-semibold tracking-widest uppercase text-[#555a6e]">Repository State</h2>
              <div className="mt-3 bg-[#1a1d27] rounded-lg border border-[#1f2330] overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2 border-b border-[#1f2330]">
                  <span className="text-[10px] text-[#555a6e] uppercase tracking-wide">Status</span>
                  <span className="font-mono text-xs text-[#e8572a] opacity-70">
                    {engineState.git.isInitialized ? "initialized" : "not initialized"}
                  </span>
                </div>
                <div className="flex items-center justify-between px-3 py-2 border-b border-[#1f2330]">
                  <span className="text-[10px] text-[#555a6e] uppercase tracking-wide">Branch</span>
                  <span className="font-mono text-xs text-[#555a6e]">
                    {engineState.git.currentBranch || "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between px-3 py-2 border-b border-[#1f2330]">
                  <span className="text-[10px] text-[#555a6e] uppercase tracking-wide">Head</span>
                  <span className="font-mono text-xs text-[#555a6e]">
                    {engineState.git.branches[engineState.git.currentBranch]?.substring(0, 7) || "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between px-3 py-2">
                  <span className="text-[10px] text-[#555a6e] uppercase tracking-wide">Commits</span>
                  <span className="font-mono text-xs text-[#8b90a0]">
                    {engineState.git.commits.length}
                  </span>
                </div>
              </div>
            </div>
            <div className="xl:hidden w-full flex justify-center py-2 relative" title="Repository State">
              <button onClick={() => setActivePopover(activePopover === 'repo' ? null : 'repo')} className="text-[#555a6e] hover:text-[#e8eaf0] transition-colors p-1">
                <GitBranch size={20} />
              </button>
              
              {/* Repo State Popover */}
              {activePopover === 'repo' && (
                <div className="absolute left-[60px] top-0 w-[240px] bg-[#1a1d27] rounded-lg border border-[#1f2330] shadow-xl z-50 overflow-hidden">
                  <div className="px-3 py-2 border-b border-[#1f2330] bg-[#13161e]">
                    <h2 className="text-[10px] font-semibold tracking-widest uppercase text-[#555a6e]">Repository State</h2>
                  </div>
                  <div className="flex items-center justify-between px-3 py-2 border-b border-[#1f2330]">
                    <span className="text-[10px] text-[#555a6e] uppercase tracking-wide">Status</span>
                    <span className="font-mono text-xs text-[#e8572a] opacity-70">
                      {engineState.git.isInitialized ? "initialized" : "not initialized"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between px-3 py-2 border-b border-[#1f2330]">
                    <span className="text-[10px] text-[#555a6e] uppercase tracking-wide">Branch</span>
                    <span className="font-mono text-xs text-[#555a6e]">
                      {engineState.git.currentBranch || "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between px-3 py-2 border-b border-[#1f2330]">
                    <span className="text-[10px] text-[#555a6e] uppercase tracking-wide">Head</span>
                    <span className="font-mono text-xs text-[#555a6e]">
                      {engineState.git.branches[engineState.git.currentBranch]?.substring(0, 7) || "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between px-3 py-2">
                    <span className="text-[10px] text-[#555a6e] uppercase tracking-wide">Commits</span>
                    <span className="font-mono text-xs text-[#8b90a0]">
                      {engineState.git.commits.length}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 3 - File Tree */}
          <div className="px-2 xl:px-4 py-4 border-b border-[#1f2330] flex flex-col items-center xl:items-start shrink-0">
            <div className="hidden xl:block w-full">
              <h2 className="text-xs font-semibold tracking-widest uppercase text-[#555a6e]">File Tree</h2>
              <div className="mt-3 flex flex-col gap-0.5">
                  <div 
                    className="flex items-center gap-1.5 text-xs font-mono py-0.5 text-[#8b90a0] cursor-pointer"
                    onClick={() => setIsFolderOpen(!isFolderOpen)}
                  >
                    {isFolderOpen ? <ChevronDown size={14} className="shrink-0" /> : <ChevronRight size={14} className="shrink-0" />}
                    <Folder size={14} className="shrink-0 text-[#e8eaf0] fill-[#e8eaf0]/20" />
                    <span className="select-none">root/</span>
                  </div>
                  {isFolderOpen && (
                    <>
                      {Object.entries((engineState.fileSystem.root as DirectoryNode).children)
                        .sort(([aName, aNode], [bName, bNode]) => {
                          if (aNode.type === bNode.type) return aName.localeCompare(bName);
                          return aNode.type === "directory" ? -1 : 1;
                        })
                        .map(([childName, childNode]) => (
                          <PlaygroundFileTreeNode
                            key={childName}
                            name={childName}
                            node={childNode}
                            depth={0}
                          />
                        ))}
                    </>
                  )}
              </div>
              <p className="mt-3 text-[10px] text-[#555a6e] italic">File tree reflects working directory</p>
            </div>
            <div className="xl:hidden w-full flex justify-center py-2 relative" title="File Tree">
              <button onClick={() => setActivePopover(activePopover === 'files' ? null : 'files')} className="text-[#555a6e] hover:text-[#e8eaf0] transition-colors p-1">
                <Folder size={20} />
              </button>
              
              {/* File Tree Popover */}
              {activePopover === 'files' && (
                <div className="absolute left-[60px] top-0 w-[240px] bg-[#1a1d27] rounded-lg border border-[#1f2330] shadow-xl z-50 overflow-hidden max-h-[50vh] flex flex-col">
                  <div className="px-3 py-2 border-b border-[#1f2330] bg-[#13161e] shrink-0">
                    <h2 className="text-[10px] font-semibold tracking-widest uppercase text-[#555a6e]">File Tree</h2>
                  </div>
                  <div className="p-3 overflow-y-auto min-h-0 scrollbar-thin scrollbar-thumb-[#1f2330] scrollbar-track-transparent">
                    <div className="flex flex-col gap-0.5">
                      <div 
                        className="flex items-center gap-1.5 text-xs font-mono py-0.5 text-[#8b90a0] cursor-pointer"
                        onClick={() => setIsFolderOpen(!isFolderOpen)}
                      >
                        {isFolderOpen ? <ChevronDown size={14} className="shrink-0" /> : <ChevronRight size={14} className="shrink-0" />}
                        <Folder size={14} className="shrink-0 text-[#e8eaf0] fill-[#e8eaf0]/20" />
                        <span className="select-none">root/</span>
                      </div>
                      {isFolderOpen && (
                        <>
                          {Object.entries((engineState.fileSystem.root as DirectoryNode).children)
                            .sort(([aName, aNode], [bName, bNode]) => {
                              if (aNode.type === bNode.type) return aName.localeCompare(bName);
                              return aNode.type === "directory" ? -1 : 1;
                            })
                            .map(([childName, childNode]) => (
                              <PlaygroundFileTreeNode
                                key={childName}
                                name={childName}
                                node={childNode}
                                depth={0}
                              />
                            ))}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 4 - Session History Log */}
          <div className="flex-1 overflow-hidden flex flex-col min-h-0 border-b border-[#1f2330]">
            <div className="hidden xl:flex items-center justify-between px-4 pt-4 pb-2 shrink-0">
              <h2 className="text-xs font-semibold tracking-widest uppercase text-[#555a6e]">Session History</h2>
              <span className="text-[10px] text-[#555a6e] hover:text-[#e8572a] font-mono cursor-pointer transition-colors">clear</span>
            </div>
            
            <div className="hidden xl:flex flex-col flex-1 overflow-y-auto px-4 pb-2 scrollbar-thin scrollbar-thumb-[#1f2330] scrollbar-track-transparent min-h-0">
              {sessionHistory.map((log, i) => (
                <div key={i} className="flex items-start gap-2 py-1.5 border-b border-[#1f2330]/50 last:border-b-0">
                  <span className="text-[10px] font-mono text-[#555a6e] mt-0.5 shrink-0">{log.time}</span>
                  <span className={`text-xs font-mono ${log.isGit ? 'text-[#e8572a]' : 'text-[#8b90a0]'}`}>{log.command}</span>
                </div>
              ))}
              <div className="text-[10px] text-[#555a6e] italic pt-2 pb-2 text-center">— session start —</div>
            </div>

            <div className="xl:hidden flex flex-col items-center pt-6 min-h-0 flex-1 overflow-visible relative" title="Session History">
              <button onClick={() => setActivePopover(activePopover === 'history' ? null : 'history')} className="text-[#555a6e] hover:text-[#e8eaf0] transition-colors p-1 relative z-0">
                <Clock size={20} />
                {sessionHistory.length > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-[#e8572a] text-white text-[9px] font-bold px-1.5 min-w-[16px] h-[16px] rounded-full flex items-center justify-center shadow-sm">
                    {sessionHistory.length}
                  </span>
                )}
              </button>
              
              {/* Session History Popover */}
              {activePopover === 'history' && (
                <div className="absolute left-[60px] bottom-0 w-[260px] bg-[#1a1d27] rounded-lg border border-[#1f2330] shadow-xl z-[100] overflow-hidden max-h-[60vh] flex flex-col">
                  <div className="px-3 py-2 border-b border-[#1f2330] bg-[#13161e] shrink-0 flex items-center justify-between">
                    <h2 className="text-[10px] font-semibold tracking-widest uppercase text-[#555a6e]">Session History</h2>
                    <span className="text-[9px] text-[#555a6e]">{sessionHistory.length} cmds</span>
                  </div>
                  <div className="flex-1 overflow-y-auto px-3 py-2 scrollbar-thin scrollbar-thumb-[#1f2330] scrollbar-track-transparent min-h-0">
                    {sessionHistory.map((log, i) => (
                      <div key={i} className="flex items-start gap-2 py-1.5 border-b border-[#1f2330]/50 last:border-b-0">
                        <span className="text-[10px] font-mono text-[#555a6e] mt-0.5 shrink-0">{log.time}</span>
                        <span className={`text-xs font-mono ${log.isGit ? 'text-[#e8572a]' : 'text-[#8b90a0]'}`}>{log.command}</span>
                      </div>
                    ))}
                    <div className="text-[10px] text-[#555a6e] italic pt-2 pb-1 text-center">— session start —</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="hidden xl:block px-4 py-3 bg-[#13161e] shrink-0 mt-auto">
            <div className="text-[10px] text-[#555a6e]">{sessionHistory.length} commands this session</div>
          </div>

        </div>
      </div>

      {/* 
        ========================================
        CENTER PANEL (Graph)
        ========================================
      */}
      <div className="
        order-1 lg:order-2 
        w-full lg:flex-1 xl:w-[44%] 
        h-[300px] lg:h-full 
        bg-[#13161e] rounded-xl max-[480px]:rounded-none border max-[480px]:border-x-0 border-[#1f2330] 
        flex flex-col min-h-0 overflow-hidden shadow-lg
      ">
        <div className="px-4 py-3 border-b border-[#1f2330] flex items-center justify-between shrink-0">
          <h2 className="text-xs font-semibold tracking-widest uppercase text-[#555a6e]">Commit Graph</h2>
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-mono px-2 py-1 rounded border border-[#1f2330] text-[#555a6e] bg-[#1a1d27] select-none">LR</span>
          </div>
        </div>
        
        <div className="flex-1 bg-[#0d0f14] relative min-h-0">
          <div id="playground-graph" className="absolute inset-0">
            {nodes.length === 0 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 pointer-events-none select-none">
                <EmptyGraphIcon />
                <div className="flex flex-col items-center">
                  <p className="font-mono text-sm text-[#555a6e]">No commits yet</p>
                  <p className="font-mono text-xs text-[#555a6e]/60 mt-1 text-center">
                    Run git init and make your first commit<br/>
                    to see the graph appear here
                  </p>
                </div>
              </div>
            ) : (
              <ReactFlowProvider>
                <PlaygroundFlowResizer nodes={nodes} />
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  nodeTypes={nodeTypes}
                  edgeTypes={edgeTypes}
                  fitView
                  fitViewOptions={{ padding: 0.2, minZoom: 0.5, maxZoom: 1.5 }}
                  minZoom={0.5}
                  maxZoom={1.5}
                  zoomOnScroll={true}
                  panOnDrag={true}
                  panOnScroll={false}
                  zoomOnDoubleClick={false}
                  zoomOnPinch={true}
                  nodesDraggable={false}
                  nodesConnectable={false}
                  elementsSelectable={false}
                  proOptions={{ hideAttribution: true }}
                >
                  <Controls 
                    position="bottom-right"
                    showInteractive={false} 
                    className="
                      !bg-[#1a1d27] !border !border-[#1f2330] !rounded-lg !overflow-hidden !shadow-lg
                      [&_button]:!bg-[#1a1d27] 
                      [&_button]:!border-b [&_button]:!border-[#1f2330] 
                      [&_button_svg]:!fill-[#555a6e] [&_button_svg]:!transition-colors
                      hover:[&_button]:!bg-[#1f2330] 
                      hover:[&_button_svg]:!fill-[#e8eaf0]
                      [&_button]:!transition-colors
                    "
                  />
                </ReactFlow>
              </ReactFlowProvider>
            )}
          </div>
        </div>
      </div>

      {/* 
        ========================================
        RIGHT PANEL (Terminal + Cheatsheet)
        ========================================
      */}
      <div className="
        order-2 lg:order-3 
        w-full lg:w-[320px] xl:w-[34%] 
        min-h-[280px] h-[400px] lg:h-full 
        bg-[#13161e] rounded-xl max-[480px]:rounded-none border max-[480px]:border-x-0 border-[#1f2330] 
        flex flex-col min-h-0 overflow-hidden shadow-lg
      ">
        {/* Terminal Sub-Section */}
        <div className="flex-1 flex flex-col min-h-0 border-b border-[#1f2330]">
          <div className="px-4 py-3 border-b border-[#1f2330] flex items-center justify-between shrink-0">
            <div className="flex items-center">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                <div className="w-3 h-3 rounded-full bg-[#28c840]" />
              </div>
              <span className="text-xs text-[#555a6e] font-mono ml-2">terminal</span>
            </div>
          </div>
          
          <div 
            className="flex-1 overflow-y-auto px-4 py-3 bg-[#0d0f14] font-mono text-sm leading-relaxed min-h-0 scrollbar-thin scrollbar-thumb-[#1f2330] scrollbar-track-transparent cursor-text"
            onClick={handleFocusClick}
          >
            <div className="text-[#555a6e]">Type a command and press Enter. Try ls or git init</div>
            <div className="h-4"></div>
            
            {history.map((entry, index) => (
              <div key={index} className="mb-4">
                <div className="flex items-center">
                  <span className="text-[#4ade80]">{promptPath}$</span>
                  <span className="ml-2 text-[#e8eaf0]">{entry.input}</span>
                </div>
                {entry.output && (
                  <div className={`mt-1 whitespace-pre-wrap break-words ${entry.output.startsWith("error:") || entry.output.startsWith("fatal:") ? "text-red-400" : "text-[#8b90a0]"}`}>
                    {entry.output}
                  </div>
                )}
              </div>
            ))}
            
            <div className="flex items-center">
              <span className="text-[#4ade80]">{promptPath}$</span>
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                className="ml-2 bg-transparent text-[#e8eaf0] outline-none flex-1 border-none focus:ring-0 p-0"
                spellCheck={false}
                autoFocus
                autoComplete="off"
              />
            </div>
            
            <div ref={terminalEndRef} />
          </div>
        </div>

        {/* Cheatsheet Sub-Section */}
        <div className="shrink-0 flex flex-col bg-[#13161e] mt-auto">
          <div 
            className="px-4 py-2.5 flex items-center justify-between cursor-pointer hover:bg-[#1a1d27]/50 transition-colors"
            onClick={() => setIsCheatsheetOpen(!isCheatsheetOpen)}
          >
            <h2 className="text-xs font-semibold tracking-widest uppercase text-[#555a6e]">Quick Reference</h2>
            {isCheatsheetOpen ? (
              <ChevronDown size={14} className="text-[#555a6e]" />
            ) : (
              <ChevronRight size={14} className="text-[#555a6e]" />
            )}
          </div>
          
          {isCheatsheetOpen && (
            <div className="border-t border-[#1f2330] bg-[#0d0f14]">
              {/* Tab Bar */}
              <div className="flex gap-0 border-b border-[#1f2330] px-4">
                <button 
                  className={`text-[10px] font-medium py-2 px-1 mr-4 border-b-2 transition-colors ${
                    activeTab === 'basics' 
                      ? 'border-[#e8572a] text-[#e8eaf0]' 
                      : 'border-transparent text-[#555a6e] hover:text-[#8b90a0]'
                  }`}
                  onClick={() => setActiveTab('basics')}
                >
                  Basics
                </button>
                <button 
                  className={`text-[10px] font-medium py-2 px-1 mr-4 border-b-2 transition-colors ${
                    activeTab === 'branching' 
                      ? 'border-[#e8572a] text-[#e8eaf0]' 
                      : 'border-transparent text-[#555a6e] hover:text-[#8b90a0]'
                  }`}
                  onClick={() => setActiveTab('branching')}
                >
                  Branching
                </button>
                <button 
                  className={`text-[10px] font-medium py-2 px-1 mr-4 border-b-2 transition-colors ${
                    activeTab === 'history' 
                      ? 'border-[#e8572a] text-[#e8eaf0]' 
                      : 'border-transparent text-[#555a6e] hover:text-[#8b90a0]'
                  }`}
                  onClick={() => setActiveTab('history')}
                >
                  History
                </button>
              </div>
              
              {/* Tab Panels */}
              <div className="px-4 py-3 overflow-y-auto max-h-[180px] scrollbar-thin scrollbar-thumb-[#1f2330] scrollbar-track-transparent">
                {cheatsheetTabs[activeTab].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 py-1.5 border-b border-[#1f2330]/40 last:border-b-0">
                    <span className="font-mono text-[10px] text-[#e8572a] shrink-0 min-w-[120px] max-w-[160px]">{item.cmd}</span>
                    <span className="text-[10px] text-[#555a6e] leading-relaxed flex-1">{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      </main>
    </div>
  );
}
