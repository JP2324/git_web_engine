"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

function GitLogo() {
    return (
        <svg
            width="28"
            height="28"
            viewBox="0 0 92 92"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M90.156 41.965L50.036 1.848a5.913 5.913 0 0 0-8.368 0l-8.332 8.332 10.566 10.566a7.03 7.03 0 0 1 7.178 1.694 7.034 7.034 0 0 1 1.669 7.277l10.187 10.184a7.028 7.028 0 0 1 7.278 1.672 7.04 7.04 0 0 1 0 9.957 7.045 7.045 0 0 1-9.961 0 7.04 7.04 0 0 1-1.532-7.66l-9.5-9.497v24.997a7.078 7.078 0 0 1 1.898 1.314 7.044 7.044 0 0 1 0 9.957 7.046 7.046 0 0 1-9.965 0 7.044 7.044 0 0 1 0-9.957 7.066 7.066 0 0 1 2.304-1.539V34.908a7.049 7.049 0 0 1-2.304-1.539 7.041 7.041 0 0 1-1.519-7.674L29.242 15.129 1.734 42.637a5.916 5.916 0 0 0 0 8.368l40.121 40.118a5.916 5.916 0 0 0 8.368 0l39.933-39.934a5.916 5.916 0 0 0 0-8.368"
                fill="#F05032"
            />
        </svg>
    );
}

function HamburgerIcon() {
    return (
        <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
    );
}

function CloseIcon() {
    return (
        <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
    );
}

interface NavLink {
    label: string;
    href: string;
    matchPrefix?: string;
}

const navLinks: NavLink[] = [
    { label: "Home", href: "/" },
    { label: "Docs", href: "/docs" },
    { label: "Learn", href: "/learn/1", matchPrefix: "/learn" },
    { label: "Playground", href: "/playground" },
];

function isLinkActive(pathname: string, link: NavLink): boolean {
    if (link.matchPrefix) return pathname.startsWith(link.matchPrefix);
    return pathname === link.href;
}

export default function Navbar() {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => {
        if (mobileOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [mobileOpen]);

    return (
        <>
            <nav
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "py-2" : "py-4"
                    }`}
            >
                <div
                    className={`mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 transition-all duration-300`}
                >
                    <div
                        className={`flex items-center justify-between h-[72px] px-4 sm:px-6 rounded-2xl border transition-all duration-300 gap-4 overflow-hidden ${scrolled
                            ? "bg-surface/90 backdrop-blur-xl border-border shadow-lg shadow-black/20"
                            : "bg-surface/60 backdrop-blur-md border-border/50"
                            }`}
                    >
                        {/* Left - Logo */}
                        <Link href="/" className="flex items-center gap-2 group flex-shrink-0 overflow-hidden">
                            <div className="transition-transform duration-200 group-hover:scale-110 flex-shrink-0">
                                <GitLogo />
                            </div>
                            <span className="text-text-primary font-semibold text-sm sm:text-base tracking-tight whitespace-nowrap">
                                Git Visual Emulator
                            </span>
                        </Link>

                        {/* Center - Nav Links (Desktop) */}
                        <div className="hidden md:flex items-center gap-1">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.label}
                                    href={link.href}
                                    className={`px-4 py-2 text-sm transition-colors duration-200 rounded-lg ${isLinkActive(pathname, link)
                                            ? "text-text-primary bg-muted-surface/60"
                                            : "text-text-secondary hover:text-text-primary hover:bg-muted-surface/50"
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>

                        {/* Right - CTA + Mobile Toggle */}
                        <div className="flex items-center gap-3">
                            <Link
                                href="/learn/1"
                                className="hidden sm:inline-flex items-center justify-center px-5 py-2.5 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-xl transition-all duration-200 glow-accent-hover"
                            >
                                Let&apos;s Learn
                            </Link>

                            {/* Mobile hamburger */}
                            <button
                                onClick={() => setMobileOpen(true)}
                                className="md:hidden p-2 text-text-secondary hover:text-text-primary transition-colors"
                                aria-label="Open menu"
                            >
                                <HamburgerIcon />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Tablet Menu Overlay (640px - 767px) Specific Fixes */}
            <div
                className={`hidden sm:block md:hidden fixed inset-0 z-[60] ${mobileOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
                aria-hidden={!mobileOpen}
            >
                {/* Backdrop - High Z, Fixed, Solid */}
                <div
                    className={`fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300 ease-in-out ${mobileOpen ? 'opacity-100' : 'opacity-0'}`}
                    onClick={() => setMobileOpen(false)}
                />

                {/* Fixed Overlay Panel */}
                <div
                    className={`fixed right-0 top-0 h-[100vh] w-[70vw] bg-background border-l border-border shadow-2xl z-[70] transition-transform duration-300 ease-out transform ${mobileOpen ? 'translate-x-0' : 'translate-x-full'}`}
                >
                    <div className="flex items-center justify-between px-6 h-[72px] border-b border-border">
                        <span className="text-text-primary font-semibold">Menu</span>
                        <button
                            onClick={() => setMobileOpen(false)}
                            className="p-2 text-text-secondary hover:text-text-primary transition-colors"
                            aria-label="Close menu"
                        >
                            <CloseIcon />
                        </button>
                    </div>

                    <div className="flex flex-col p-6 gap-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.label}
                                href={link.href}
                                onClick={() => setMobileOpen(false)}
                                className={`px-4 py-3 rounded-lg transition-colors text-base ${isLinkActive(pathname, link)
                                        ? "text-text-primary bg-muted-surface/60"
                                        : "text-text-secondary hover:text-text-primary hover:bg-muted-surface/50"
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Core Mobile Sheet Overlay (< 640px) */}
            <div
                className={`sm:hidden fixed inset-0 z-[60] ${mobileOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
                aria-hidden={!mobileOpen}
            >
                {/* Backdrop - High Z, Fixed, Solid */}
                <div
                    className={`fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300 ease-in-out ${mobileOpen ? 'opacity-100' : 'opacity-0'}`}
                    onClick={() => setMobileOpen(false)}
                />

                {/* Fixed Overlay Panel */}
                <div
                    className={`fixed right-0 top-0 h-[100vh] w-[300px] max-w-[calc(100vw-2rem)] bg-background border-l border-border shadow-2xl z-[70] transition-transform duration-300 ease-out transform ${mobileOpen ? 'translate-x-0' : 'translate-x-full'}`}
                >
                    <div className="flex items-center justify-between px-6 h-[72px] border-b border-border">
                        <span className="text-text-primary font-semibold">Menu</span>
                        <button
                            onClick={() => setMobileOpen(false)}
                            className="p-2 text-text-secondary hover:text-text-primary transition-colors"
                            aria-label="Close menu"
                        >
                            <CloseIcon />
                        </button>
                    </div>

                    <div className="flex flex-col p-6 gap-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.label}
                                href={link.href}
                                onClick={() => setMobileOpen(false)}
                                className={`px-4 py-3 rounded-lg transition-colors text-base ${isLinkActive(pathname, link)
                                        ? "text-text-primary bg-muted-surface/60"
                                        : "text-text-secondary hover:text-text-primary hover:bg-muted-surface/50"
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}

                        <div className="mt-4 pt-4 border-t border-border">
                            <Link
                                href="/learn/1"
                                onClick={() => setMobileOpen(false)}
                                className="flex items-center justify-center w-full px-5 py-3 bg-accent hover:bg-accent-hover text-white font-medium rounded-xl transition-all duration-200 glow-accent-hover"
                            >
                                Let&apos;s Learn
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
