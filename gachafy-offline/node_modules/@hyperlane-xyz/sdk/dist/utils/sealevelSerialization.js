export class SealevelInstructionWrapper {
    fields;
    instruction;
    data;
    constructor(fields) {
        this.fields = fields;
        Object.assign(this, fields);
    }
}
export class SealevelAccountDataWrapper {
    fields;
    initialized;
    discriminator;
    data;
    constructor(fields) {
        this.fields = fields;
        Object.assign(this, fields);
    }
}
export function getSealevelAccountDataSchema(DataClass, discriminator) {
    return {
        kind: 'struct',
        fields: [
            ['initialized', 'u8'],
            ...(discriminator ? [['discriminator', discriminator]] : []),
            ['data', DataClass],
        ],
    };
}
// The format of simulation return data from the Sealevel programs.
// A trailing non-zero byte was added due to a bug in Sealevel RPCs that would
// truncate responses with trailing zero bytes.
export class SealevelSimulationReturnData {
    fields;
    return_data;
    trailing_byte;
    constructor(fields) {
        this.fields = fields;
        Object.assign(this, fields);
    }
}
export function getSealevelSimulationReturnDataSchema(DataClass) {
    return {
        kind: 'struct',
        fields: [
            ['data', DataClass],
            ['trailing_byte', 'u8'],
        ],
    };
}
//# sourceMappingURL=sealevelSerialization.js.map