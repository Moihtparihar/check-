import { Logger } from 'pino';
import { MultiProvider } from '../../providers/MultiProvider.js';
import { ChainName } from '../../types.js';
import { BaseContractVerifier } from './BaseContractVerifier.js';
import { ContractVerificationInput, SolidityStandardJsonInput, ZKSyncCompilerOptions } from './types.js';
/**
 * @title ZKSyncContractVerifier
 * @notice Handles the verification of ZkSync contracts on block explorers
 * @dev This class manages the process of verifying ZkSync contracts, including
 * preparing verification data and submitting it to the appropriate explorer API
 * Note: Etherscan verification is managed by the ContractVerifier class
 * Blockscout verification is not currently supported on ZkSync
 */
export declare class ZKSyncContractVerifier extends BaseContractVerifier {
    protected readonly multiProvider: MultiProvider;
    protected logger: import("pino").default.Logger<never>;
    protected readonly standardInputJson: SolidityStandardJsonInput;
    protected readonly compilerOptions: ZKSyncCompilerOptions;
    /**
     * @notice Creates a new ZKSyncContractVerifier instance
     * @param multiProvider An instance of MultiProvider for interacting with multiple chains
     */
    constructor(multiProvider: MultiProvider);
    /**
     * @notice Verifies a contract on the specified chain
     * @param chain The name of the chain where the contract is deployed
     * @param input The contract verification input data
     * @param verificationLogger A logger instance for verification-specific logging
     */
    protected verify(chain: ChainName, input: ContractVerificationInput, verificationLogger: Logger): Promise<void>;
    protected prepareImplementationData(sourceName: string, input: ContractVerificationInput, filteredStandardInputJson: SolidityStandardJsonInput): {
        codeFormat: "solidity-standard-json-input";
        compilerSolcVersion: string;
        compilerZksolcVersion: string;
        optimizationUsed: boolean;
        sourceCode: SolidityStandardJsonInput;
        contractName: string;
        contractAddress: string;
        constructorArguments: string;
    };
    /**
     * @notice Submits the verification form to the explorer API
     * @param chain The name of the chain where the contract is deployed
     * @param verificationLogger A logger instance for verification-specific logging
     * @param options Additional options for the API request
     * @returns The response from the explorer API
     */
    private submitForm;
}
//# sourceMappingURL=ZKSyncContractVerifier.d.ts.map