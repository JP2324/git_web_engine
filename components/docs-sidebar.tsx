"use client";

import * as React from "react";
import { cn, ScrollArea } from "./docs-ui";

const NAV_ITEMS = [
    { id: "init", title: "Initialize Repository", command: "git init" },
    { id: "commit", title: "Create Commit", command: "git commit" },
    { id: "branch", title: "Manage Branches", command: "git branch" },
    { id: "checkout", title: "Switch Branches", command: "git checkout" },
    { id: "merge", title: "Merge Branches", command: "git merge" },
    { id: "rebase", title: "Rebase Commits", command: "git rebase" },
    { id: "cherry-pick", title: "Cherry Pick", command: "git cherry-pick" },
];

interface SidebarNavProps {
    className?: string;
    activeId?: string;
    onSelect?: (id: string) => void;
}

function SidebarNav({ className, activeId, onSelect }: SidebarNavProps) {
    return (
        <div className={cn("flex flex-col space-y-5 bg-surface/30 rounded-xl p-2 border border-border/20", className)}>
            <div className="px-3 pt-2 flex items-center gap-2.5 text-text-secondary/80 font-medium text-[13px] tracking-wider uppercase">
                <div className="w-1.5 h-1.5 rounded-full bg-accent/80 shadow-[0_0_8px_rgba(240,80,50,0.6)]" />
                Core Commands
            </div>
            <div className="space-y-1.5 px-1 pb-2">
                {NAV_ITEMS.map((item) => {
                    const isActive = activeId === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onSelect?.(item.id)}
                            className={cn(
                                "w-full flex items-center justify-between rounded-lg px-3 py-2.5 text-[13px] transition-all duration-300 border-l-[3px]",
                                isActive
                                    ? "bg-accent/10 border-accent text-accent font-medium shadow-[inset_4px_0_0_rgba(240,80,50,0.4),0_4px_20px_rgba(240,80,50,0.05)]"
                                    : "border-transparent text-text-secondary hover:bg-surface hover:text-text-primary hover:border-border/50"
                            )}
                        >
                            <span>{item.title}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export function DocsSidebar() {
    const [activeId, setActiveId] = React.useState("init");

    // Basic scrollspy 
    React.useEffect(() => {
        const handleScroll = () => {
            const sections = NAV_ITEMS.map(i => document.getElementById(i.id));
            const scrollY = window.scrollY;

            let currentId = activeId;
            for (const section of sections) {
                if (section) {
                    const sectionTop = section.offsetTop - 100;
                    if (scrollY >= sectionTop) {
                        currentId = section.id;
                    }
                }
            }

            if (currentId !== activeId) {
                setActiveId(currentId);
            }
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, [activeId]);

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            const offsetTop = element.offsetTop - 80;
            window.scrollTo({ top: offsetTop, behavior: "smooth" });
        }
        setActiveId(id);
    };

    return (
        <>

            {/* Desktop & Mid-Size Sidebar (1024px+) */}
            <aside className="hidden lg:block sticky top-[132px] w-[220px] xl:w-[260px] shrink-0 h-[calc(100vh-140px)] overflow-y-auto pb-10 z-20">
                <div className="h-full relative pl-0 xl:pl-2 pr-4 xl:pr-6">
                    <ScrollArea className="h-full pr-2">
                        <SidebarNav activeId={activeId} onSelect={scrollToSection} />
                    </ScrollArea>
                </div>
            </aside>
        </>
    );
}
