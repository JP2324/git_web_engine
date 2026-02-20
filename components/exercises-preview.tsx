"use client";

import { useEffect, useRef } from "react";

const exercises = [
    {
        step: 1,
        title: "Init & Commit",
        description: "Create your first repository and make initial commits",
        status: "complete" as const,
    },
    {
        step: 2,
        title: "Branching Basics",
        description: "Learn to create and switch between branches",
        status: "complete" as const,
    },
    {
        step: 3,
        title: "Merging",
        description: "Combine branch histories with merge strategies",
        status: "current" as const,
    },
    {
        step: 4,
        title: "Rebasing",
        description: "Rewrite commit history with interactive rebase",
        status: "upcoming" as const,
    },
    {
        step: 5,
        title: "Cherry Pick",
        description: "Selectively apply commits across branches",
        status: "upcoming" as const,
    },
];

export default function ExercisesPreview() {
    const sectionRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("visible");
                    }
                });
            },
            { threshold: 0.1 }
        );

        const elements = sectionRef.current?.querySelectorAll(".reveal");
        elements?.forEach((el) => observer.observe(el));

        return () => observer.disconnect();
    }, []);

    return (
        <section ref={sectionRef} id="exercises" className="py-24 sm:py-32">
            <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="reveal text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 mb-4">
                        <span className="text-accent text-xs font-medium tracking-wide uppercase">
                            Learning Path
                        </span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-bold text-text-primary tracking-tight">
                        10 Step Learning Path
                    </h2>
                    <p className="mt-4 text-text-secondary text-lg max-w-2xl mx-auto">
                        A structured curriculum that takes you from git init to advanced
                        workflows, one concept at a time.
                    </p>
                </div>

                {/* Exercise Steps */}
                <div className="reveal overflow-hidden">
                    <div className="flex flex-col lg:flex-row lg:items-stretch lg:flex-nowrap gap-6 lg:gap-0">
                        {exercises.flatMap((exercise, index) => {
                            const items = [
                                <div
                                    key={`card-${exercise.step}`}
                                    className="flex-1 min-w-0"
                                >
                                    {/* Exercise Card */}
                                    <div
                                        className={`relative flex flex-col items-center p-6 rounded-2xl border transition-all duration-300 h-full group ${exercise.status === "current"
                                            ? "bg-surface border-accent/40 shadow-lg shadow-accent/5"
                                            : exercise.status === "complete"
                                                ? "bg-surface border-border hover:border-accent/20"
                                                : "bg-surface/60 border-border/60"
                                            }`}
                                        style={{ animationDelay: `${index * 0.1}s` }}
                                    >
                                        {/* Step Number Circle */}
                                        <div
                                            className={`flex items-center justify-center w-10 h-10 rounded-full mb-4 text-sm font-bold transition-all ${exercise.status === "current"
                                                ? "bg-accent text-white pulse-glow"
                                                : exercise.status === "complete"
                                                    ? "bg-accent/20 text-accent border border-accent/30"
                                                    : "bg-muted-surface text-text-secondary border border-border"
                                                }`}
                                        >
                                            {exercise.status === "complete" ? (
                                                <svg
                                                    width="16"
                                                    height="16"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="3"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                >
                                                    <polyline points="20 6 9 17 4 12" />
                                                </svg>
                                            ) : (
                                                exercise.step
                                            )}
                                        </div>

                                        <h3
                                            className={`text-sm font-semibold text-center mb-1.5 ${exercise.status === "upcoming"
                                                ? "text-text-secondary"
                                                : "text-text-primary"
                                                }`}
                                        >
                                            {exercise.title}
                                        </h3>

                                        <p className="text-xs text-text-secondary text-center leading-relaxed">
                                            {exercise.description}
                                        </p>

                                        {/* Current indicator */}
                                        {exercise.status === "current" && (
                                            <div className="absolute -top-px left-4 right-4 h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent rounded-full" />
                                        )}
                                    </div>
                                </div>
                            ];

                            {/* Connector line - flex item between cards, desktop only */ }
                            if (index < exercises.length - 1) {
                                items.push(
                                    <div
                                        key={`connector-${exercise.step}`}
                                        className="hidden lg:flex items-center w-4 shrink-0"
                                    >
                                        <div
                                            className={`w-full h-[2px] ${exercise.status === "complete"
                                                ? "bg-gradient-to-r from-accent to-accent/50"
                                                : "bg-border"
                                                }`}
                                        />
                                    </div>
                                );
                            }

                            return items;
                        })}
                    </div>
                </div>

                {/* Bottom note */}
                <div className="reveal text-center mt-12">
                    <p className="text-text-secondary text-sm">
                        …and 5 more advanced exercises including{" "}
                        <span className="text-text-primary font-medium">stashing</span>,{" "}
                        <span className="text-text-primary font-medium">reset</span>,{" "}
                        <span className="text-text-primary font-medium">reflog</span>, and
                        more.
                    </p>
                </div>
            </div>
        </section>
    );
}
