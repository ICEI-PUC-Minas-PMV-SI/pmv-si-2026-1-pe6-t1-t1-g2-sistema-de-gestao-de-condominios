import { parseAst } from '@tanstack/router-utils';
export type ParsedAst = ReturnType<typeof parseAst>;
export declare function parseImportProtectionAst(code: string): ParsedAst;
