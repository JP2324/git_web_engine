"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

function GitGraph() {
    return (
        <div className="relative w-full h-full min-h-[400px] flex items-center justify-center p-6">
            <svg
                viewBox="0 0 400 380"
                className="w-full h-auto max-w-[400px]"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                {/* Grid dots background */}
                {Array.from({ length: 8 }).map((_, row) =>
                    Array.from({ length: 10 }).map((_, col) => (
                        <circle
                            key={`dot-${row}-${col}`}
                            cx={20 + col * 40}
                            cy={20 + row * 48}
                            r="1"
                            fill="#2D3748"
                            opacity="0.5"
                        />
                    ))
                )}

                {/* Main branch line */}
                <path
                    d="M 80 40 L 80 120 L 80 200 L 80 280 L 80 340"
                    stroke="#9CA3AF"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                />

                {/* Feature branch line */}
                <path
                    d="M 80 120 C 120 120, 160 100, 200 80 L 280 80 C 320 80, 320 120, 320 160 L 320 200 C 320 240, 280 280, 80 280"
                    stroke="#F05032"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeDasharray="0"
                />

                {/* Commit nodes - main branch */}
                {/* Initial commit */}
                <circle cx="80" cy="40" r="8" fill="#111827" stroke="#9CA3AF" strokeWidth="2.5" />
                <circle cx="80" cy="40" r="3.5" fill="#9CA3AF" />

                {/* Second commit */}
                <circle cx="80" cy="120" r="8" fill="#111827" stroke="#9CA3AF" strokeWidth="2.5" />
                <circle cx="80" cy="120" r="3.5" fill="#9CA3AF" />

                {/* Third commit (on main, after branch) */}
                <circle cx="80" cy="200" r="8" fill="#111827" stroke="#9CA3AF" strokeWidth="2.5" />
                <circle cx="80" cy="200" r="3.5" fill="#9CA3AF" />

                {/* Merge commit */}
                <circle cx="80" cy="280" r="10" fill="#111827" stroke="#F05032" strokeWidth="3" className="pulse-glow" />
                <circle cx="80" cy="280" r="4" fill="#F05032" />

                {/* Latest commit after merge */}
                <circle cx="80" cy="340" r="8" fill="#111827" stroke="#9CA3AF" strokeWidth="2.5" />
                <circle cx="80" cy="340" r="3.5" fill="#9CA3AF" />

                {/* Feature branch commits */}
                <circle cx="200" cy="80" r="8" fill="#111827" stroke="#F05032" strokeWidth="2.5" />
                <circle cx="200" cy="80" r="3.5" fill="#F05032" />

                <circle cx="280" cy="80" r="8" fill="#111827" stroke="#F05032" strokeWidth="2.5" />
                <circle cx="280" cy="80" r="3.5" fill="#F05032" />

                <circle cx="320" cy="160" r="8" fill="#111827" stroke="#F05032" strokeWidth="2.5" />
                <circle cx="320" cy="160" r="3.5" fill="#F05032" />

                {/* Branch labels */}
                {/* main label */}
                <rect x="100" y="330" width="54" height="22" rx="6" fill="#1F2937" stroke="#2D3748" strokeWidth="1" />
                <text x="127" y="345" textAnchor="middle" fill="#9CA3AF" fontSize="11" fontFamily="Inter, monospace" fontWeight="500">
                    main
                </text>

                {/* feature label */}
                <rect x="226" y="44" width="68" height="22" rx="6" fill="#1F2937" stroke="#F05032" strokeWidth="1" opacity="0.9" />
                <text x="260" y="59" textAnchor="middle" fill="#F05032" fontSize="11" fontFamily="Inter, monospace" fontWeight="500">
                    feature
                </text>

                {/* Merge label */}
                <rect x="96" y="270" width="58" height="22" rx="6" fill="#1F2937" stroke="#F05032" strokeWidth="1" opacity="0.8" />
                <text x="125" y="285" textAnchor="middle" fill="#F05032" fontSize="10" fontFamily="Inter, monospace" fontWeight="500">
                    merge
                </text>

                {/* Commit hashes */}
                <text x="56" y="44" textAnchor="end" fill="#4A5568" fontSize="9" fontFamily="monospace">
                    a1b2c3d
                </text>
                <text x="56" y="124" textAnchor="end" fill="#4A5568" fontSize="9" fontFamily="monospace">
                    e4f5g6h
                </text>
                <text x="56" y="204" textAnchor="end" fill="#4A5568" fontSize="9" fontFamily="monospace">
                    i7j8k9l
                </text>
                <text x="56" y="284" textAnchor="end" fill="#4A5568" fontSize="9" fontFamily="monospace">
                    m0n1o2p
                </text>
            </svg>
        </div>
    );
}

export default function Hero() {
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
            className="relative min-h-screen flex items-center pt-28 pb-16 overflow-hidden"
        >
            {/* Subtle background gradient */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] bg-accent/3 rounded-full blur-[100px]" />
            </div>

            <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 w-full">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    {/* Left - Content */}
                    <div className="flex flex-col gap-8">
                        <div className="reveal">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 mb-6">
                                <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                                <span className="text-accent text-xs font-medium tracking-wide uppercase">
                                    Interactive Learning
                                </span>
                            </div>

                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-text-primary leading-[1.1] tracking-tight">
                                Master Git{" "}
                                <span className="relative">
                                    <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-accent to-orange-400">
                                        Visually.
                                    </span>
                                </span>
                            </h1>
                        </div>

                        <p className="reveal text-lg sm:text-xl text-text-secondary leading-relaxed max-w-lg" style={{ animationDelay: "0.1s" }}>
                            Understand branches, merges, rebases and commit history through an
                            interactive visual simulator designed for developers.
                        </p>

                        <div className="reveal flex flex-col sm:flex-row items-start sm:items-center gap-4" style={{ animationDelay: "0.2s" }}>
                            <Link
                                href="/emulator"
                                className="inline-flex items-center justify-center px-7 py-3.5 bg-accent hover:bg-accent-hover text-white font-semibold rounded-xl transition-all duration-300 text-base glow-accent glow-accent-hover hover:scale-[1.03] active:scale-[0.98]"
                            >
                                Let&apos;s Learn
                                <svg
                                    className="ml-2 w-4 h-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                                    />
                                </svg>
                            </Link>

                            <a
                                href="#exercises"
                                className="inline-flex items-center text-text-secondary hover:text-text-primary transition-colors duration-200 text-sm font-medium group"
                            >
                                View Exercises
                                <svg
                                    className="ml-1.5 w-4 h-4 group-hover:translate-x-0.5 transition-transform"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M9 5l7 7-7 7"
                                    />
                                </svg>
                            </a>
                        </div>
                    </div>

                    {/* Right - Git Graph */}
                    <div className="reveal flex justify-center lg:justify-end" style={{ animationDelay: "0.3s" }}>
                        <div className="relative w-full max-w-md lg:max-w-lg">
                            <div className="rounded-2xl border border-border bg-surface/80 backdrop-blur-sm overflow-hidden shadow-2xl shadow-black/30">
                                {/* Mock window header */}
                                <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted-surface/50">
                                    <div className="w-3 h-3 rounded-full bg-red-500/70" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                                    <div className="w-3 h-3 rounded-full bg-green-500/70" />
                                    <span className="ml-3 text-xs text-text-secondary font-mono">
                                        git log --graph --oneline
                                    </span>
                                </div>

                                <GitGraph />
                            </div>

                            {/* Decorative glow behind card */}
                            <div className="absolute -inset-4 bg-accent/5 rounded-3xl blur-2xl -z-10" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
