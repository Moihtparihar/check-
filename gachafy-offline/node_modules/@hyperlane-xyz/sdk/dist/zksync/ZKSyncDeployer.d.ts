import { BigNumber, BytesLike, Overrides } from 'ethers';
import { Contract, Wallet, types as zksyncTypes } from 'zksync-ethers';
import { ZKSyncArtifact } from '@hyperlane-xyz/core';
/**
 * Class for deploying contracts to the ZKSync network.
 */
export declare class ZKSyncDeployer {
    zkWallet: Wallet;
    deploymentType?: zksyncTypes.DeploymentType;
    constructor(zkWallet: Wallet, deploymentType?: zksyncTypes.DeploymentType);
    /**
     * Loads and validates a ZKSync contract artifact by name
     * @param contractTitle - Contract name or qualified name (sourceName:contractName)
     *
     * @returns The ZKSync artifact
     */
    private loadArtifact;
    /**
     * Estimates the price of calling a deploy transaction in ETH.
     *
     * @param artifact The previously loaded artifact object.
     * @param constructorArguments List of arguments to be passed to the contract constructor.
     *
     * @returns Calculated fee in ETH wei
     */
    estimateDeployFee(artifact: ZKSyncArtifact, constructorArguments: any[]): Promise<BigNumber>;
    /**
     * Estimates the amount of gas needed to execute a deploy transaction.
     *
     * @param artifact The previously loaded artifact object.
     * @param constructorArguments List of arguments to be passed to the contract constructor.
     *
     * @returns Calculated amount of gas.
     */
    estimateDeployGas(artifact: ZKSyncArtifact, constructorArguments: any[]): Promise<BigNumber>;
    /**
     * Sends a deploy transaction to the zkSync network.
     * For now, it will use defaults for the transaction parameters:
     * - fee amount is requested automatically from the zkSync server.
     *
     * @param artifact The previously loaded artifact object.
     * @param constructorArguments List of arguments to be passed to the contract constructor.
     * @param overrides Optional object with additional deploy transaction parameters.
     * @param additionalFactoryDeps Additional contract bytecodes to be added to the factory dependencies list.
     *
     * @returns A contract object.
     */
    deploy(artifact: ZKSyncArtifact, constructorArguments?: any[], overrides?: Overrides, additionalFactoryDeps?: BytesLike[]): Promise<Contract>;
    /**
     * Extracts factory dependencies from the artifact.
     *
     * @param artifact Artifact to extract dependencies from
     *
     * @returns Factory dependencies in the format expected by SDK.
     */
    extractFactoryDeps(artifact: ZKSyncArtifact): Promise<string[]>;
    private extractFactoryDepsRecursive;
}
//# sourceMappingURL=ZKSyncDeployer.d.ts.map