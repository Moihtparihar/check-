import type { Contract } from 'ethers';
import { z } from 'zod';
import type { AccessControl, Ownable, TimelockController } from '@hyperlane-xyz/core';
import { Address } from '@hyperlane-xyz/utils';
import type { ChainName } from '../types.js';
export declare const ProxyFactoryFactoriesSchema: z.ZodObject<{
    staticMerkleRootMultisigIsmFactory: z.ZodString;
    staticMessageIdMultisigIsmFactory: z.ZodString;
    staticAggregationIsmFactory: z.ZodString;
    staticAggregationHookFactory: z.ZodString;
    domainRoutingIsmFactory: z.ZodString;
    staticMerkleRootWeightedMultisigIsmFactory: z.ZodString;
    staticMessageIdWeightedMultisigIsmFactory: z.ZodString;
}, "strip", z.ZodTypeAny, {
    staticMerkleRootMultisigIsmFactory: string;
    staticMessageIdMultisigIsmFactory: string;
    staticAggregationIsmFactory: string;
    staticAggregationHookFactory: string;
    domainRoutingIsmFactory: string;
    staticMerkleRootWeightedMultisigIsmFactory: string;
    staticMessageIdWeightedMultisigIsmFactory: string;
}, {
    staticMerkleRootMultisigIsmFactory: string;
    staticMessageIdMultisigIsmFactory: string;
    staticAggregationIsmFactory: string;
    staticAggregationHookFactory: string;
    domainRoutingIsmFactory: string;
    staticMerkleRootWeightedMultisigIsmFactory: string;
    staticMessageIdWeightedMultisigIsmFactory: string;
}>;
export type ProxyFactoryFactoriesAddresses = z.infer<typeof ProxyFactoryFactoriesSchema>;
export interface CheckerViolation {
    chain: ChainName;
    type: string;
    expected: any;
    actual: any;
    contract?: Contract;
}
export declare enum ViolationType {
    Owner = "Owner",
    NotDeployed = "NotDeployed",
    BytecodeMismatch = "BytecodeMismatch",
    ProxyAdmin = "ProxyAdmin",
    TimelockController = "TimelockController",
    AccessControl = "AccessControl",
    TokenMismatch = "TokenMismatch"
}
export interface OwnerViolation extends CheckerViolation {
    type: ViolationType.Owner;
    contract: Ownable;
    name: string;
    actual: string;
    expected: string;
}
export interface ProxyAdminViolation extends CheckerViolation {
    type: ViolationType.ProxyAdmin;
    proxyAddress: Address;
    name: string;
}
export interface TimelockControllerViolation extends CheckerViolation {
    type: ViolationType.TimelockController;
    actual: number;
    expected: number;
    contract: TimelockController;
}
export interface AccessControlViolation extends CheckerViolation {
    type: ViolationType.AccessControl;
    role: string;
    account: string;
    actual: boolean;
    expected: boolean;
    contract: AccessControl;
}
export interface NotDeployedViolation extends CheckerViolation {
    type: ViolationType.NotDeployed;
}
export interface BytecodeMismatchViolation extends CheckerViolation {
    type: ViolationType.BytecodeMismatch;
    name: string;
}
export interface TokenMismatchViolation extends CheckerViolation {
    tokenAddress: Address;
}
//# sourceMappingURL=types.d.ts.map