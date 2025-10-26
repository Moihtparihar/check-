import { ZKSyncArtifact } from '@hyperlane-xyz/core';
/**
 * @dev Retrieves a ZkSync artifact by its contract name or qualified name.
 * @param name The name of the contract or qualified name in the format "sourceName:contractName".
 * @return The corresponding ZKSyncArtifact if found, or undefined if not found.
 */
export declare const getZKSyncArtifactByContractName: (name: string) => Promise<ZKSyncArtifact | undefined>;
//# sourceMappingURL=zksync.d.ts.map