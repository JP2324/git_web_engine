"use client";

import { useEffect, useRef } from "react";

const features = [
    {
        title: "Visual Branching",
        description:
            "See branches come to life as visual trees. Create, switch, and delete branches with real-time graph updates that make Git's branching model intuitive.",
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F05032" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="6" y1="3" x2="6" y2="15" />
                <circle cx="18" cy="6" r="3" />
                <circle cx="6" cy="18" r="3" />
                <path d="M18 9a9 9 0 0 1-9 9" />
            </svg>
        ),
    },
    {
        title: "Merge & Rebase Simulator",
        description:
            "Compare merge and rebase strategies side by side. Watch how commits reorganize and understand conflict resolution in a visual context.",
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F05032" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="18" r="3" />
                <circle cx="6" cy="6" r="3" />
                <path d="M6 21V9a9 9 0 0 0 9 9" />
                <path d="M6 3v6" />
            </svg>
        ),
    },
    {
        title: "10 Structured Exercises",
        description:
            "Follow a curated learning path from init to cherry-pick. Each exercise builds on the last with clear instructions and instant visual feedback.",
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F05032" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
        ),
    },
];

export default function Features() {
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
        <section
            ref={sectionRef}
            id="features"
            className="py-24 sm:py-32"
        >
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="reveal text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 mb-4">
                        <span className="text-accent text-xs font-medium tracking-wide uppercase">
                            Features
                        </span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-bold text-text-primary tracking-tight">
                        Everything you need to learn Git
                    </h2>
                    <p className="mt-4 text-text-secondary text-lg max-w-2xl mx-auto">
                        Built with visual learners in mind. Every Git concept comes alive
                        through interactive visualizations.
                    </p>
                </div>

                {/* Feature Cards Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, index) => (
                        <div
                            key={feature.title}
                            className="reveal group relative rounded-2xl border border-border bg-surface p-8 transition-all duration-300 hover:-translate-y-1 hover:border-border hover:shadow-lg hover:shadow-black/20"
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            {/* Accent line at top */}
                            <div className="absolute top-0 left-8 right-8 h-[2px] bg-gradient-to-r from-transparent via-accent/60 to-transparent rounded-full" />

                            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 mb-5">
                                {feature.icon}
                            </div>

                            <h3 className="text-xl font-semibold text-text-primary mb-3">
                                {feature.title}
                            </h3>

                            <p className="text-text-secondary text-sm leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
