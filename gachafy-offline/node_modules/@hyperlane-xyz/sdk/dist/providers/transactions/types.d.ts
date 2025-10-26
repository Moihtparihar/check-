import { z } from 'zod';
export declare const BigNumberSchema: z.ZodString;
export declare const CallDataSchema: z.ZodObject<{
    to: z.ZodString;
    data: z.ZodString;
    value: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    data: string;
    to: string;
    value?: string | undefined;
}, {
    data: string;
    to: string;
    value?: string | undefined;
}>;
export type CallData = z.infer<typeof CallDataSchema>;
//# sourceMappingURL=types.d.ts.map