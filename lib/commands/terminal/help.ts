import type { CommandResult, EngineState } from "../../engine/types";

/**
 * help command — lists available commands for the current exercise.
 * Receives allowedCommands as a parameter to stay exercise-agnostic.
 */
export function helpWithCommands(
    state: EngineState,
    _args: string[],
    allowedCommands: string[]
): CommandResult {
    const lines = [
        "Available commands:",
        "",
        ...allowedCommands.map((cmd) => `  ${cmd}`),
    ];

    return { state, output: lines.join("\n") };
}
