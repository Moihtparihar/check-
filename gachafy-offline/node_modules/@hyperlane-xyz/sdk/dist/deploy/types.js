import { z } from 'zod';
export const ProxyFactoryFactoriesSchema = z.object({
    staticMerkleRootMultisigIsmFactory: z.string(),
    staticMessageIdMultisigIsmFactory: z.string(),
    staticAggregationIsmFactory: z.string(),
    staticAggregationHookFactory: z.string(),
    domainRoutingIsmFactory: z.string(),
    staticMerkleRootWeightedMultisigIsmFactory: z.string(),
    staticMessageIdWeightedMultisigIsmFactory: z.string(),
});
export var ViolationType;
(function (ViolationType) {
    ViolationType["Owner"] = "Owner";
    ViolationType["NotDeployed"] = "NotDeployed";
    ViolationType["BytecodeMismatch"] = "BytecodeMismatch";
    ViolationType["ProxyAdmin"] = "ProxyAdmin";
    ViolationType["TimelockController"] = "TimelockController";
    ViolationType["AccessControl"] = "AccessControl";
    ViolationType["TokenMismatch"] = "TokenMismatch";
})(ViolationType || (ViolationType = {}));
//# sourceMappingURL=types.js.map