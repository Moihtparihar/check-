export declare class SealevelInstructionWrapper<Instr> {
    readonly fields: any;
    instruction: number;
    data: Instr;
    constructor(fields: any);
}
export declare class SealevelAccountDataWrapper<T> {
    readonly fields: any;
    initialized: boolean;
    discriminator?: unknown;
    data: T;
    constructor(fields: any);
}
export declare function getSealevelAccountDataSchema<T>(DataClass: T, discriminator?: any): {
    kind: string;
    fields: any[][];
};
export declare class SealevelSimulationReturnData<T> {
    readonly fields: any;
    return_data: T;
    trailing_byte: number;
    constructor(fields: any);
}
export declare function getSealevelSimulationReturnDataSchema<T>(DataClass: T): {
    kind: string;
    fields: (string | T)[][];
};
//# sourceMappingURL=sealevelSerialization.d.ts.map