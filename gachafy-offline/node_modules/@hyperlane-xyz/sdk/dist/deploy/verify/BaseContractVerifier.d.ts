import { Logger } from 'pino';
import { MultiProvider } from '../../providers/MultiProvider.js';
import { ChainName } from '../../types.js';
import { BuildArtifact, ContractVerificationInput, SolidityStandardJsonInput } from './types.js';
export declare abstract class BaseContractVerifier {
    protected readonly multiProvider: MultiProvider;
    protected logger: import("pino").default.Logger<never>;
    protected contractSourceMap: {
        [contractName: string]: string;
    };
    protected readonly standardInputJson: SolidityStandardJsonInput;
    constructor(multiProvider: MultiProvider, buildArtifact: BuildArtifact);
    protected createContractSourceMapFromBuildArtifacts(): void;
    verifyContract(chain: ChainName, input: ContractVerificationInput, logger?: import("pino").default.Logger<never>): Promise<void>;
    protected shouldVerifyContract(chain: ChainName, input: ContractVerificationInput, verificationLogger: Logger): boolean;
    protected abstract verify(chain: ChainName, input: ContractVerificationInput, verificationLogger: Logger): Promise<void>;
    protected getImplementationData(chain: ChainName, input: ContractVerificationInput, verificationLogger: Logger): any;
    protected abstract prepareImplementationData(sourceName: string, input: ContractVerificationInput, filteredStandardInputJson: SolidityStandardJsonInput): any;
    protected filterStandardInputJsonByContractName(contractName: string, input: SolidityStandardJsonInput, verificationLogger: Logger): SolidityStandardJsonInput;
    protected getAllImportStatements(content: string): string[];
    protected resolveImportPath(currentFile: string, importPath: string): string;
}
//# sourceMappingURL=BaseContractVerifier.d.ts.map