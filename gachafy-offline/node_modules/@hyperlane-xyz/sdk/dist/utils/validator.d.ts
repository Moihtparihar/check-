import { S3Validator } from '../aws/validator.js';
import { GcpValidator } from '../gcp/validator.js';
export declare function getValidatorFromStorageLocation(location: string): Promise<S3Validator | GcpValidator>;
export declare function isValidValidatorStorageLocation(location: string): boolean;
//# sourceMappingURL=validator.d.ts.map