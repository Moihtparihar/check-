import { z } from 'zod';
export declare const HyperlaneDeploymentArtifactsSchema: z.ZodObject<{
    mailbox: z.ZodString;
    merkleTreeHook: z.ZodString;
    interchainGasPaymaster: z.ZodString;
    validatorAnnounce: z.ZodString;
    interchainSecurityModule: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    merkleTreeHook: string;
    interchainGasPaymaster: string;
    mailbox: string;
    validatorAnnounce: string;
    interchainSecurityModule?: string | undefined;
}, {
    merkleTreeHook: string;
    interchainGasPaymaster: string;
    mailbox: string;
    validatorAnnounce: string;
    interchainSecurityModule?: string | undefined;
}>;
export type HyperlaneDeploymentArtifacts = z.infer<typeof HyperlaneDeploymentArtifactsSchema>;
//# sourceMappingURL=deploymentArtifacts.d.ts.map