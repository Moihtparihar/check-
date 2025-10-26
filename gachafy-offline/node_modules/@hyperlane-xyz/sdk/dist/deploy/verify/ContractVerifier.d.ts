import { Logger } from 'pino';
import { Address } from '@hyperlane-xyz/utils';
import { MultiProvider } from '../../providers/MultiProvider.js';
import { ContractVerificationStatus } from '../../token/types.js';
import { ChainMap, ChainName } from '../../types.js';
import { BaseContractVerifier } from './BaseContractVerifier.js';
import { BuildArtifact, CompilerOptions, ContractVerificationInput, SolidityStandardJsonInput } from './types.js';
export declare class ContractVerifier extends BaseContractVerifier {
    protected readonly multiProvider: MultiProvider;
    protected readonly apiKeys: ChainMap<string>;
    protected logger: import("pino").default.Logger<never>;
    protected readonly compilerOptions: CompilerOptions;
    constructor(multiProvider: MultiProvider, apiKeys: ChainMap<string>, buildArtifact: BuildArtifact, licenseType: CompilerOptions['licenseType']);
    protected verify(chain: ChainName, input: ContractVerificationInput, verificationLogger: Logger): Promise<void>;
    private checkStatus;
    protected prepareImplementationData(sourceName: string, input: ContractVerificationInput, filteredStandardInputJson: SolidityStandardJsonInput): {
        codeformat: "solidity-standard-json-input";
        compilerversion: string;
        licenseType?: import("./types.js").ExplorerLicenseType | undefined;
        zksolcversion?: string | undefined;
        sourceCode: string;
        contractname: string;
        contractaddress: string;
        constructorArguements: string;
    };
    /**
     * @notice Submits the verification form to the explorer API
     * @param chain The name of the chain where the contract is deployed
     * @param verificationLogger A logger instance for verification-specific logging
     * @param options Additional options for the API request
     * @returns The response from the explorer API
     */
    private submitForm;
    getContractVerificationStatus(chain: ChainName, address: Address, verificationLogger?: Logger): Promise<ContractVerificationStatus>;
    private getProxyData;
}
//# sourceMappingURL=ContractVerifier.d.ts.map