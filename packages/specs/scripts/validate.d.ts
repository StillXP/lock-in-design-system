export declare function loadSpecs(): Array<{ file: string; spec: any }>;
export declare function validateSpec(spec: unknown, file?: string, tokens?: Map<string, unknown>): string[];
