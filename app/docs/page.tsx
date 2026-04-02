import * as React from "react";
import { DocsSidebar } from "@/components/docs-sidebar";
import { DocsSection } from "@/components/docs-section";

// --- Node Data Definitions ---

const c1 = { id: 'c1', position: { x: 0, y: 0 }, data: { label: 'C1' }, type: 'commit' };
const c2 = { id: 'c2', position: { x: 150, y: 0 }, data: { label: 'C2' }, type: 'commit' };
const c3 = { id: 'c3', position: { x: 300, y: 0 }, data: { label: 'C3' }, type: 'commit' };
const c4 = { id: 'c4', position: { x: 450, y: 0 }, data: { label: 'C4' }, type: 'commit' };

const b1 = { id: 'b1', position: { x: 150, y: 120 }, data: { label: 'B1' }, type: 'commit' };
const b2 = { id: 'b2', position: { x: 300, y: 120 }, data: { label: 'B2' }, type: 'commit' };

const m1 = { id: 'm1', position: { x: 450, y: 0 }, data: { label: 'M1' }, type: 'commit' };

import type { Node, Edge } from "@xyflow/react";

// 1. git init
const initBeforeNodes: Node[] = [];
const initBeforeEdges: Edge[] = [];
const initAfterNodes: Node[] = [
    { ...c1, data: { label: 'C1', branches: ['main'], isActive: true, message: 'Initial commit' } }
];
const initAfterEdges: Edge[] = [];

// 2. git commit
const commitBeforeNodes = [
    { ...c1, data: { label: 'C1', branches: ['main'], isActive: true } }
];
const commitBeforeEdges: Edge[] = [];
const commitAfterNodes = [
    { ...c1, data: { label: 'C1' } },
    { ...c2, data: { label: 'C2', branches: ['main'], isActive: true } }
];
const commitAfterEdges = [
    { id: 'e1-2', source: 'c1', target: 'c2', type: 'gitEdge', data: { isActive: true } }
];

// 3. git branch
const branchBeforeNodes = [
    { ...c1, data: { label: 'C1' } },
    { ...c2, data: { label: 'C2', branches: ['main'], isActive: true } }
];
const branchAfterNodes = [
    { ...c1, data: { label: 'C1' } },
    { ...c2, data: { label: 'C2', branches: ['main', 'feature'], isActive: true } }
];
const branchAfterEdges = commitAfterEdges;

// 4. git checkout
// let's refine checkout to show branching
const checkoutBeforeNodesRefined = [
    { ...c1, data: { label: 'C1' } },
    { ...c2, data: { label: 'C2', branches: ['main'], isActive: true } },
    { ...b1, data: { label: 'C3', branches: ['feature'] } }
];
const checkoutBeforeEdgesRefined = [
    { id: 'e1-2', source: 'c1', target: 'c2', type: 'gitEdge' },
    { id: 'e1-b1', source: 'c1', target: 'b1', type: 'gitEdge' }
];
const checkoutAfterNodesRefined = [
    { ...c1, data: { label: 'C1' } },
    { ...c2, data: { label: 'C2', branches: ['main'] } },
    { ...b1, data: { label: 'C3', branches: ['feature'], isActive: true } }
];
const checkoutAfterEdgesRefined = [
    { id: 'e1-2', source: 'c1', target: 'c2', type: 'gitEdge' },
    { id: 'e1-b1', source: 'c1', target: 'b1', type: 'gitEdge', data: { isActive: true } }
];

// 5. git merge
const mergeBeforeNodes = [
    { ...c1, data: { label: 'C1' } },
    { ...c2, data: { label: 'C2', branches: ['main'], isActive: true } },
    { ...b1, data: { label: 'C3' } },
    { ...b2, data: { label: 'C4', branches: ['feature'] } }
];
const mergeBeforeEdges = [
    { id: 'e1-2', source: 'c1', target: 'c2', type: 'gitEdge' },
    { id: 'e1-b1', source: 'c1', target: 'b1', type: 'gitEdge' },
    { id: 'eb1-b2', source: 'b1', target: 'b2', type: 'gitEdge' }
];
const mergeAfterNodes = [
    { ...c1, data: { label: 'C1' } },
    { ...c2, data: { label: 'C2' } },
    { ...b1, data: { label: 'C3' } },
    { ...b2, data: { label: 'C4', branches: ['feature'] } },
    { ...m1, data: { label: 'M1', branches: ['main'], isActive: true, message: 'Merge commit' } }
];
const mergeAfterEdges = [
    { id: 'e1-2', source: 'c1', target: 'c2', type: 'gitEdge' },
    { id: 'e1-b1', source: 'c1', target: 'b1', type: 'gitEdge' },
    { id: 'eb1-b2', source: 'b1', target: 'b2', type: 'gitEdge' },
    { id: 'e2-m1', source: 'c2', target: 'm1', type: 'gitEdge', data: { isActive: true } },
    { id: 'eb2-m1', source: 'b2', target: 'm1', type: 'gitEdge', data: { isActive: true } }
];

// 6. git rebase
const rebaseBeforeNodes = [
    { ...c1, data: { label: 'C1' } },
    { ...c2, data: { label: 'C2', branches: ['main'] } },
    { ...b1, data: { label: 'C3' } },
    { ...b2, data: { label: 'C4', branches: ['feature'], isActive: true } }
];
const rebaseBeforeEdges = [
    { id: 'e1-2', source: 'c1', target: 'c2', type: 'gitEdge' },
    { id: 'e1-b1', source: 'c1', target: 'b1', type: 'gitEdge', data: { isActive: true } },
    { id: 'eb1-b2', source: 'b1', target: 'b2', type: 'gitEdge', data: { isActive: true } }
];
const rebaseAfterNodes = [
    { ...c1, data: { label: 'C1' } },
    { ...c2, data: { label: 'C2', branches: ['main'] } },
    { ...c3, data: { label: 'C3\'' } },
    { ...c4, data: { label: 'C4\'', branches: ['feature'], isActive: true } }
];
const rebaseAfterEdges = [
    { id: 'e1-2', source: 'c1', target: 'c2', type: 'gitEdge' },
    { id: 'e2-3', source: 'c2', target: 'c3', type: 'gitEdge', data: { isActive: true } },
    { id: 'e3-4', source: 'c3', target: 'c4', type: 'gitEdge', data: { isActive: true } }
];

// 7. git cherry-pick
const cherryBeforeNodes = [
    { ...c1, data: { label: 'C1' } },
    { ...c2, data: { label: 'C2', branches: ['main'], isActive: true } },
    { ...b1, position: { x: 150, y: -120 }, data: { label: 'C3' } },
    { ...b2, position: { x: 300, y: -120 }, data: { label: 'C4', branches: ['feature'] } }
];
const cherryBeforeEdges = [
    { id: 'e1-2', source: 'c1', target: 'c2', type: 'gitEdge', data: { isActive: true } },
    { id: 'e1-b1', source: 'c1', target: 'b1', type: 'gitEdge' },
    { id: 'eb1-b2', source: 'b1', target: 'b2', type: 'gitEdge' }
];
// Cherry pick C4 onto main
const cherryAfterNodes = [
    { ...c1, data: { label: 'C1' } },
    { ...c2, data: { label: 'C2' } },
    { ...c3, data: { label: 'C4\'', branches: ['main'], isActive: true, message: 'Cherry-picked C4' } },
    { ...b1, position: { x: 150, y: -120 }, data: { label: 'C3' } },
    { ...b2, position: { x: 300, y: -120 }, data: { label: 'C4', branches: ['feature'] } }
];
const cherryAfterEdges = [
    { id: 'e1-2', source: 'c1', target: 'c2', type: 'gitEdge' },
    { id: 'e2-3', source: 'c2', target: 'c3', type: 'gitEdge', data: { isActive: true } },
    { id: 'e1-b1', source: 'c1', target: 'b1', type: 'gitEdge' },
    { id: 'eb1-b2', source: 'b1', target: 'b2', type: 'gitEdge' }
];

// 8. git status, 9. git add, 11. git diff (Read-Only 1 commit)
const oneCommitReadOnlyNodes = [
    { ...c1, data: { label: 'C1', branches: ['main'], isActive: true } }
];
const oneCommitReadOnlyEdges: Edge[] = [];

// 10. git log (Read-Only 3 commits)
const threeCommitReadOnlyNodes = [
    { ...c1, data: { label: 'C1' } },
    { ...c2, data: { label: 'C2' } },
    { ...c3, data: { label: 'C3', branches: ['main'], isActive: true } }
];
const threeCommitReadOnlyEdges = [
    { id: 'e1-2', source: 'c1', target: 'c2', type: 'gitEdge' },
    { id: 'e2-3', source: 'c2', target: 'c3', type: 'gitEdge' }
];

const readOnlyNote = (
    <div className="text-center text-sm italic text-text-secondary/80 bg-surface/30 p-2 rounded-lg border border-border/20">
        This command does not modify commit history.
    </div>
);

const statusAfterTerminal = (
    <div className="mt-4 p-4 rounded-xl bg-background/80 border border-border/40 font-mono text-sm text-text-secondary shadow-inner">
        <div className="text-text-primary mb-2">On branch main</div>
        <div className="text-text-primary mb-1">Untracked files:</div>
        <div className="text-accent mb-2">  (use "git add &lt;file&gt;..." to include in what will be committed)</div>
        <div className="text-accent pl-4">feature.js</div>
    </div>
);

const addAfterTerminal = (
    <div className="mt-4 p-4 rounded-xl bg-background/80 border border-border/40 font-mono text-sm text-text-secondary shadow-inner">
        <div className="text-text-primary mb-2">On branch main</div>
        <div className="text-text-primary mb-1">Changes to be committed:</div>
        <div className="text-green-500 mb-2">  (use "git restore --staged &lt;file&gt;..." to unstage)</div>
        <div className="text-green-500 pl-4">new file:   feature.js</div>
        <div className="mt-3 text-xs italic text-text-secondary/60 font-sans">
            Note: The file <code className="bg-surface px-1 py-0.5 rounded border border-border/30">feature.js</code> is now in the staging area, ready to commit.
        </div>
    </div>
);

const logAfterTerminal = (
    <div className="mt-4 p-4 rounded-xl bg-background/80 border border-border/40 font-mono text-sm text-text-secondary shadow-inner space-y-3">
        <div>
            <span className="text-accent">commit c3a8d9b</span> (HEAD -&gt; main)<br />
            Author: User &lt;user@example.com&gt;<br />
            Date:   Today<br /><br />
            <span className="pl-4">Third commit</span>
        </div>
        <div>
            <span className="text-accent">commit b2f7c6e</span><br />
            Author: User &lt;user@example.com&gt;<br />
            Date:   Yesterday<br /><br />
            <span className="pl-4">Second commit</span>
        </div>
        <div>
            <span className="text-accent">commit a1e5b4c</span><br />
            Author: User &lt;user@example.com&gt;<br />
            Date:   Two days ago<br /><br />
            <span className="pl-4">Initial commit</span>
        </div>
    </div>
);

const diffAfterTerminal = (
    <div className="mt-4 p-4 rounded-xl bg-background/80 border border-border/40 font-mono text-sm shadow-inner overflow-x-auto whitespace-pre">
        <span className="text-text-primary font-bold">diff --git a/feature.js b/feature.js</span><br />
        <span className="text-text-secondary">index 83db48f..f84236a 100644</span><br />
        <span className="text-text-primary font-bold">--- a/feature.js</span><br />
        <span className="text-text-primary font-bold">+++ b/feature.js</span><br />
        <span className="text-blue-400">@@ -1,3 +1,4 @@</span><br />
        <span className="text-text-secondary"> function init() {'{'}</span><br />
        <span className="text-text-secondary">   console.log("ready");</span><br />
        <span className="text-green-500">+  setupListeners();</span><br />
        <span className="text-text-secondary"> {'}'}</span>
    </div>
);

// 12. git revert
const revertBeforeNodes = [
    { ...c1, data: { label: 'C1' } },
    { ...c2, data: { label: 'C2', branches: ['main'], isActive: true } }
];
const revertBeforeEdges = [
    { id: 'e1-2', source: 'c1', target: 'c2', type: 'gitEdge' }
];
const revertAfterNodes = [
    { ...c1, data: { label: 'C1' } },
    { ...c2, data: { label: 'C2' } },
    { ...c3, data: { label: 'C3', branches: ['main'], isActive: true, message: 'Revert "C2"' } }
];
const revertAfterEdges = [
    { id: 'e1-2', source: 'c1', target: 'c2', type: 'gitEdge' },
    { id: 'e2-3', source: 'c2', target: 'c3', type: 'gitEdge', data: { isActive: true } }
];

// 13 & 14. git reset --soft and git reset --hard
const resetBeforeNodes = threeCommitReadOnlyNodes;
const resetBeforeEdges = threeCommitReadOnlyEdges;
const resetAfterNodes = [
    { ...c1, data: { label: 'C1' } },
    { ...c2, data: { label: 'C2', branches: ['main'], isActive: true } }
];
const resetAfterEdges = [
    { id: 'e1-2', source: 'c1', target: 'c2', type: 'gitEdge', data: { isActive: true } }
];

import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

export default function DocsPage() {
    return (
        <div className="flex flex-col min-h-screen bg-background isolate relative overflow-x-clip">
            {/* Background Radial Glow */}
            <div className="pointer-events-none fixed inset-0 flex justify-center z-[-1]">
                <div className="w-[800px] h-[600px] bg-accent/5 rounded-full blur-[120px] opacity-70 translate-y-[-20%]" />
            </div>

            <div className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl shadow-sm">
                <Navbar />
            </div>

            <div className="flex-1 w-full">
                <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8 w-full flex flex-col lg:flex-row gap-8 lg:gap-12 pt-32 pb-32 items-start relative">

                    {/* Faint Radial Glow behind Title */}
                    <div className="absolute top-32 left-1/2 lg:left-1/3 -translate-x-1/2 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px] pointer-events-none z-[-1]" />

                    <DocsSidebar />

                    <main className="flex-1 min-w-0 w-full">
                        <div className="space-y-48">

                            <div className="space-y-8 pt-4 pb-12">
                                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-text-primary drop-shadow-sm">
                                    Git Commands <span className="text-transparent bg-clip-text bg-gradient-to-br from-accent to-accent-hover text-glow">Reference</span>
                                </h1>
                                <p className="text-lg md:text-xl text-text-secondary leading-relaxed max-w-3xl">
                                    Explore how essential Git commands reshape your commit history through interactive visual simulations. Understand branches, merges, rebases, and cherry-picks the way Git actually processes them.
                                </p>
                            </div>

                            <DocsSection
                                id="init"
                                title="Initialize Repository"
                                command="git init"
                                description="Creates a new, empty Git repository or reinitializes an existing one. This creates a .git directory with subdirectories and template files."
                                beforeNodes={initBeforeNodes}
                                beforeEdges={initBeforeEdges}
                                afterNodes={initAfterNodes}
                                afterEdges={initAfterEdges}
                            />

                            <DocsSection
                                id="status"
                                title="Check Status"
                                command="git status"
                                description="Shows the current state of the working directory and staging area. Displays which files are untracked, which are staged for the next commit, and which have been modified since the last commit. As a read-only command, it observes state but never changes it."
                                beforeNodes={oneCommitReadOnlyNodes}
                                beforeEdges={oneCommitReadOnlyEdges}
                                afterNodes={oneCommitReadOnlyNodes}
                                afterEdges={oneCommitReadOnlyEdges}
                                beforeExtra={readOnlyNote}
                                afterExtra={
                                    <>
                                        {readOnlyNote}
                                        {statusAfterTerminal}
                                    </>
                                }
                            />

                            <DocsSection
                                id="add"
                                title="Stage Changes"
                                command="git add"
                                description="Adds file contents from the working directory to the staging area, preparing them to be included in the next commit. You can stage all files at once with git add . or stage individual files with git add <filename>."
                                beforeNodes={oneCommitReadOnlyNodes}
                                beforeEdges={oneCommitReadOnlyEdges}
                                afterNodes={oneCommitReadOnlyNodes}
                                afterEdges={oneCommitReadOnlyEdges}
                                beforeExtra={readOnlyNote}
                                afterExtra={
                                    <>
                                        {readOnlyNote}
                                        {addAfterTerminal}
                                    </>
                                }
                            />

                            <DocsSection
                                id="commit"
                                title="Create Commit"
                                command="git commit -m 'message'"
                                description="Records changes to the repository. This creates a new commit containing the current contents of the index and the given log message describing the changes."
                                beforeNodes={commitBeforeNodes}
                                beforeEdges={commitBeforeEdges}
                                afterNodes={commitAfterNodes}
                                afterEdges={commitAfterEdges}
                            />

                            <DocsSection
                                id="log"
                                title="View Commit History"
                                command="git log"
                                description="Displays the full commit history of the current branch, showing each commit's hash, author, date, and message. The most recent commit appears at the top. Use git log --oneline for a compact view. This command never modifies the repository."
                                beforeNodes={threeCommitReadOnlyNodes}
                                beforeEdges={threeCommitReadOnlyEdges}
                                afterNodes={threeCommitReadOnlyNodes}
                                afterEdges={threeCommitReadOnlyEdges}
                                beforeExtra={readOnlyNote}
                                afterExtra={
                                    <>
                                        {readOnlyNote}
                                        {logAfterTerminal}
                                    </>
                                }
                            />

                            <DocsSection
                                id="diff"
                                title="Show Changes"
                                command="git diff"
                                description="Shows the differences between the working directory and the staging area, or between commits. Use it to review exactly what has changed in your files before staging or committing. This is a read-only inspection command."
                                beforeNodes={oneCommitReadOnlyNodes}
                                beforeEdges={oneCommitReadOnlyEdges}
                                afterNodes={oneCommitReadOnlyNodes}
                                afterEdges={oneCommitReadOnlyEdges}
                                beforeExtra={readOnlyNote}
                                afterExtra={
                                    <>
                                        {readOnlyNote}
                                        {diffAfterTerminal}
                                    </>
                                }
                            />

                            <DocsSection
                                id="branch"
                                title="Manage Branches"
                                command="git branch feature"
                                description="Creates a new branch pointer at the current commit. Branches are lightweight pointers to specific commits, allowing you to diverge from the main line of development."
                                beforeNodes={branchBeforeNodes}
                                beforeEdges={commitAfterEdges}
                                afterNodes={branchAfterNodes}
                                afterEdges={branchAfterEdges}
                            />

                            <DocsSection
                                id="checkout"
                                title="Switch Branches"
                                command="git checkout feature"
                                description="Updates files in the working tree to match the version in the specified branch, and updates HEAD to point to that branch."
                                beforeNodes={checkoutBeforeNodesRefined}
                                beforeEdges={checkoutBeforeEdgesRefined}
                                afterNodes={checkoutAfterNodesRefined}
                                afterEdges={checkoutAfterEdgesRefined}
                            />

                            <DocsSection
                                id="merge"
                                title="Merge Branches"
                                command="git merge feature"
                                description="Incorporates changes from the named commits into the current branch. This creates a new 'merge commit' that has two parent commits."
                                beforeNodes={mergeBeforeNodes}
                                beforeEdges={mergeBeforeEdges}
                                afterNodes={mergeAfterNodes}
                                afterEdges={mergeAfterEdges}
                            />

                            <DocsSection
                                id="revert"
                                title="Revert Commit"
                                command="git revert"
                                description="Creates a new commit that undoes the changes introduced by a previous commit. Unlike reset, revert is non-destructive — the original commit remains in the history and a new undo commit is added on top. This is the safe way to undo changes on shared branches."
                                beforeNodes={revertBeforeNodes}
                                beforeEdges={revertBeforeEdges}
                                afterNodes={revertAfterNodes}
                                afterEdges={revertAfterEdges}
                            />

                            <DocsSection
                                id="reset-soft"
                                title="Soft Reset"
                                command="git reset --soft"
                                description="Moves the HEAD pointer back by one or more commits without discarding your changes. The changes from the undone commits remain in the staging area, ready to be recommitted. Use this to amend commit history while keeping your work intact."
                                beforeNodes={resetBeforeNodes}
                                beforeEdges={resetBeforeEdges}
                                afterNodes={resetAfterNodes}
                                afterEdges={resetAfterEdges}
                            />

                            <DocsSection
                                id="reset-hard"
                                title="Hard Reset"
                                command="git reset --hard"
                                description="Moves the HEAD pointer back by one or more commits and permanently discards all changes from the removed commits. Both the commits and their file changes are gone. Changes discarded permanently. Use with caution — this cannot be undone."
                                beforeNodes={resetBeforeNodes}
                                beforeEdges={resetBeforeEdges}
                                afterNodes={resetAfterNodes}
                                afterEdges={resetAfterEdges}
                            />

                            <DocsSection
                                id="rebase"
                                title="Rebase Commits"
                                command="git rebase main"
                                description="Reapplies commits on top of another base tip. This rewrites commit history by creating brand new commits for each commit in the original branch."
                                beforeNodes={rebaseBeforeNodes}
                                beforeEdges={rebaseBeforeEdges}
                                afterNodes={rebaseAfterNodes}
                                afterEdges={rebaseAfterEdges}
                            />

                            <DocsSection
                                id="cherry-pick"
                                title="Cherry Pick"
                                command="git cherry-pick C4"
                                description="Applies the changes introduced by some existing commits on top of the current branch. This creates a new commit with the exact same changes."
                                beforeNodes={cherryBeforeNodes}
                                beforeEdges={cherryBeforeEdges}
                                afterNodes={cherryAfterNodes}
                                afterEdges={cherryAfterEdges}
                            />

                        </div>
                    </main>
                </div>
            </div>

            <Footer />
        </div>
    );
}
