import Link from "next/link";

function GitLogo() {
    return (
        <svg
            width="24"
            height="24"
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

const footerLinks = [
    { label: "About", href: "#about" },
    { label: "GitHub", href: "https://github.com" },
    { label: "Docs", href: "#docs" },
    { label: "Contact", href: "#contact" },
];

export default function Footer() {
    return (
        <footer className="border-t border-border bg-surface/50">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
                    {/* Left - Brand */}
                    <div className="flex flex-col gap-3">
                        <Link href="/" className="flex items-center gap-2.5">
                            <GitLogo />
                            <span className="text-text-primary font-semibold text-base">
                                Git Visual Emulator
                            </span>
                        </Link>
                        <p className="text-text-secondary text-sm max-w-xs leading-relaxed">
                            Learn Git through interactive visual simulations. Built for developers who think visually.
                        </p>
                    </div>

                    {/* Right - Links */}
                    <div className="flex flex-wrap gap-6 sm:gap-8">
                        {footerLinks.map((link) => (
                            <a
                                key={link.label}
                                href={link.href}
                                className="text-sm text-text-secondary hover:text-text-primary transition-colors duration-200"
                            >
                                {link.label}
                            </a>
                        ))}
                    </div>
                </div>

                {/* Bottom - Copyright */}
                <div className="mt-10 pt-6 border-t border-border/50">
                    <p className="text-xs text-text-secondary/60 text-center sm:text-left">
                        © {new Date().getFullYear()} Git Visual Emulator. Built with ❤️ for
                        developers.
                    </p>
                </div>
            </div>
        </footer>
    );
}
