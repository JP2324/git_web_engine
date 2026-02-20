"use client";

import * as React from "react";

// Utility for merging classes
export function cn(...classes: (string | undefined | null | false)[]) {
    return classes.filter(Boolean).join(" ");
}

// Button
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "outline" | "ghost";
    size?: "default" | "sm" | "icon";
}
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "default", size = "default", ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={cn(
                    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-border disabled:pointer-events-none disabled:opacity-50",
                    variant === "default" && "bg-accent text-white hover:bg-accent-hover",
                    variant === "outline" && "border border-border bg-transparent hover:bg-muted-surface text-text-primary",
                    variant === "ghost" && "hover:bg-muted-surface text-text-primary",
                    size === "default" && "h-9 px-4 py-2",
                    size === "sm" && "h-8 rounded-md px-3 text-xs",
                    size === "icon" && "h-9 w-9",
                    className
                )}
                {...props}
            />
        );
    }
);
Button.displayName = "Button";

// Card
export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn("rounded-xl border border-border bg-surface text-text-primary shadow", className)} {...props} />
    )
);
Card.displayName = "Card";

export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
    )
);
CardHeader.displayName = "CardHeader";

export const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
    ({ className, ...props }, ref) => (
        <h3 ref={ref} className={cn("font-semibold leading-none tracking-tight", className)} {...props} />
    )
);
CardTitle.displayName = "CardTitle";

export const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
    ({ className, ...props }, ref) => (
        <p ref={ref} className={cn("text-sm text-text-secondary", className)} {...props} />
    )
);
CardDescription.displayName = "CardDescription";

export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
    )
);
CardContent.displayName = "CardContent";

// Badge
export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "secondary" | "outline";
}
export function Badge({ className, variant = "default", ...props }: BadgeProps) {
    return (
        <div
            className={cn(
                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-border",
                variant === "default" && "border-transparent bg-muted-surface text-text-primary hover:bg-muted-surface/80",
                variant === "secondary" && "border-transparent bg-surface text-text-primary hover:bg-surface/80",
                variant === "outline" && "text-text-primary",
                className
            )}
            {...props}
        />
    );
}

// Separator
export const Separator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { orientation?: "horizontal" | "vertical" }>(
    ({ className, orientation = "horizontal", ...props }, ref) => (
        <div
            ref={ref}
            className={cn(
                "shrink-0 bg-border",
                orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
                className
            )}
            {...props}
        />
    )
);
Separator.displayName = "Separator";

// ScrollArea
export const ScrollArea = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, children, ...props }, ref) => (
        <div ref={ref} className={cn("relative overflow-auto", className)} {...props}>
            {children}
        </div>
    )
);
ScrollArea.displayName = "ScrollArea";

// Tabs Component System
type TabsContextValue = {
    value: string;
    onValueChange: (value: string) => void;
};
const TabsContext = React.createContext<TabsContextValue | undefined>(undefined);

export function Tabs({ defaultValue, value, onValueChange, className, children }: {
    defaultValue?: string;
    value?: string;
    onValueChange?: (value: string) => void;
    className?: string;
    children: React.ReactNode;
}) {
    const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue || "");
    const currentValue = value !== undefined ? value : uncontrolledValue;
    const handleValueChange = React.useCallback(
        (newValue: string) => {
            setUncontrolledValue(newValue);
            onValueChange?.(newValue);
        },
        [onValueChange]
    );
    return (
        <TabsContext.Provider value={{ value: currentValue, onValueChange: handleValueChange }}>
            <div className={cn("w-full", className)}>{children}</div>
        </TabsContext.Provider>
    );
}

export const TabsList = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            className={cn(
                "inline-flex h-10 items-center justify-center rounded-lg bg-surface p-1 text-text-secondary border border-border",
                className
            )}
            {...props}
        />
    )
);
TabsList.displayName = "TabsList";

export const TabsTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string }>(
    ({ className, value, ...props }, ref) => {
        const context = React.useContext(TabsContext);
        const isSelected = context?.value === value;
        return (
            <button
                ref={ref}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => context?.onValueChange(value)}
                className={cn(
                    "inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                    isSelected
                        ? "bg-gradient-to-b from-accent to-accent-hover text-white shadow-[0_0_12px_rgba(240,80,50,0.4)] border border-accent-hover"
                        : "hover:bg-muted-surface/50 text-text-secondary hover:text-text-primary",
                    className
                )}
                {...props}
            />
        );
    }
);
TabsTrigger.displayName = "TabsTrigger";

export const TabsContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { value: string }>(
    ({ className, value, ...props }, ref) => {
        const context = React.useContext(TabsContext);
        if (context?.value !== value) return null;
        return (
            <div
                ref={ref}
                role="tabpanel"
                className={cn(
                    "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border",
                    className
                )}
                {...props}
            />
        );
    }
);
TabsContent.displayName = "TabsContent";

// Sheet Component System (Mobile Sidebar)
type SheetContextValue = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};
const SheetContext = React.createContext<SheetContextValue | undefined>(undefined);

export function Sheet({ open, onOpenChange, children }: { open?: boolean; onOpenChange?: (open: boolean) => void; children: React.ReactNode }) {
    const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
    const isOpen = open !== undefined ? open : uncontrolledOpen;
    const handleOpenChange = React.useCallback(
        (newOpen: boolean) => {
            setUncontrolledOpen(newOpen);
            if (onOpenChange) onOpenChange(newOpen);
        },
        [onOpenChange]
    );
    return <SheetContext.Provider value={{ open: isOpen, onOpenChange: handleOpenChange }}>{children}</SheetContext.Provider>;
}

export function SheetTrigger({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) {
    const context = React.useContext(SheetContext);
    if (asChild && React.isValidElement(children)) {
        const childElement = children as React.ReactElement<{ onClick?: (e: React.MouseEvent) => void }>;
        return React.cloneElement(childElement, {
            ...childElement.props,
            onClick: (e: React.MouseEvent) => {
                childElement.props.onClick?.(e);
                context?.onOpenChange(true);
            },
        });
    }
    return <div onClick={() => context?.onOpenChange(true)}>{children}</div>;
}

export function SheetContent({ children, className, side = "left" }: { children: React.ReactNode; className?: string; side?: "left" | "right" }) {
    const context = React.useContext(SheetContext);
    if (!context?.open) return null;

    return (
        <div className="fixed inset-0 z-50 flex">
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => context.onOpenChange(false)} />
            <div
                className={cn(
                    "fixed z-50 gap-4 bg-background border-border p-6 shadow-lg transition ease-in-out duration-300",
                    side === "left" ? "inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm" : "inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm",
                    className
                )}
            >
                <button
                    onClick={() => context.onOpenChange(false)}
                    className="absolute right-4 top-4 rounded-sm text-text-secondary opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-border focus:ring-offset-2 disabled:pointer-events-none"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                    <span className="sr-only">Close</span>
                </button>
                {children}
            </div>
        </div>
    );
}
