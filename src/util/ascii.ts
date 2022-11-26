export function colorizeForeground(text: string, color: number): string {
    return `\x1b[${color + 30}${color >= 100 ? ';1' : ''}m${text}\x1b[0m`;
}

export function colorizeBackground(text: string, color: number): string {
    return `\x1b[${color + 40}${color >= 100 ? ';1' : ''}m${text}\x1b[0m`;
}
