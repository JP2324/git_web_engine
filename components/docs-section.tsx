"use client";

import * as React from "react";
import { Card, CardContent, Tabs, TabsList, TabsTrigger, TabsContent, Badge, Separator, cn } from "./docs-ui";
import { GitFlowExample } from "./git-flow-example";
import type { Node, Edge } from "@xyflow/react";

export interface DocsSectionProps {
    id: string;
    title: string;
    command: string;
    description: string;
    beforeNodes: Node[];
    beforeEdges: Edge[];
    afterNodes: Node[];
    afterEdges: Edge[];
}

export function DocsSection({ id, title, command, description, beforeNodes, beforeEdges, afterNodes, afterEdges }: DocsSectionProps) {
    const [isVisible, setIsVisible] = React.useState(false);
    const sectionRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => observer.disconnect();
    }, []);

    return (
        <div ref={sectionRef} id={id} className={cn("scroll-mt-24 lg:scroll-mt-32 space-y-12 transition-all duration-700 ease-out", isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8")}>
            <div className="space-y-5">
                <h2 className="text-3xl font-bold tracking-tight text-text-primary flex items-center gap-4 relative">
                    <span className="relative pb-1">
                        {title}
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-accent to-transparent rounded-full" />
                    </span>
                    <Badge variant="secondary" className="font-mono text-sm px-3 py-1 bg-accent/15 text-accent border border-accent/30 shadow-[0_0_10px_rgba(240,80,50,0.1)]">
                        {command}
                    </Badge>
                </h2>
                <p className="text-lg text-text-secondary leading-relaxed max-w-3xl">
                    {description}
                </p>
            </div>

            <Card className="rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.3)] border-border/30 bg-gradient-to-br from-surface/40 to-surface/10 backdrop-blur-md overflow-hidden transition-all duration-500">
                <CardContent className="p-6 md:p-8 lg:p-10">
                    <Tabs defaultValue="after" className="w-full">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 pb-4 sm:pb-0 gap-6">
                            <h3 className="text-base md:text-lg font-semibold text-text-primary tracking-tight">Visual Example</h3>
                            <TabsList className="relative w-full sm:w-[280px] h-11 bg-surface/80 p-1 rounded-full shadow-inner border border-border/40 grid grid-cols-2 backdrop-blur-sm">
                                <TabsTrigger value="before" className="rounded-full z-10 font-medium text-sm transition-all duration-300 data-[state=active]:bg-gradient-to-b data-[state=active]:from-accent data-[state=active]:to-accent-hover data-[state=active]:text-white data-[state=active]:shadow-[0_0_15px_rgba(240,80,50,0.4)]">Before</TabsTrigger>
                                <TabsTrigger value="after" className="rounded-full z-10 font-medium text-sm transition-all duration-300 data-[state=active]:bg-gradient-to-b data-[state=active]:from-accent data-[state=active]:to-accent-hover data-[state=active]:text-white data-[state=active]:shadow-[0_0_15px_rgba(240,80,50,0.4)]">After</TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="before" className="mt-0 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:zoom-in-[0.98] data-[state=active]:duration-500">
                            {beforeNodes.length > 0 ? (
                                <GitFlowExample nodes={beforeNodes} edges={beforeEdges} />
                            ) : (
                                <div className="w-full h-[380px] bg-background/30 rounded-2xl border border-border/30 flex items-center justify-center text-text-secondary/60 shadow-[inset_0_2px_20px_rgba(0,0,0,0.1)] backdrop-blur-sm">
                                    Empty State (No Commits)
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="after" className="mt-0 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:zoom-in-[0.98] data-[state=active]:duration-500">
                            <GitFlowExample nodes={afterNodes} edges={afterEdges} />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            <Separator className="mt-20 opacity-40" />
        </div>
    );
}
