export interface ContrastResult { theme: string; mode: 'light' | 'dark'; fg: string; bg: string; ratio: number; min: number; pass: boolean }
export declare function checkContrast(srcDir?: string): ContrastResult[];
