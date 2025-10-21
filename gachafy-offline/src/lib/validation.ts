import { z } from 'zod';

// Wallet address validation
export const walletAddressSchema = z.string()
  .min(10, 'Invalid wallet address')
  .max(200, 'Invalid wallet address')
  .regex(/^account_/, 'Must be a valid Radix account address');

// Transaction hash validation
export const txHashSchema = z.string()
  .min(10, 'Invalid transaction hash')
  .max(200, 'Invalid transaction hash');

// Tier validation
export const tierSchema = z.object({
  id: z.enum(['common', 'rare', 'epic']),
  name: z.string(),
  price: z.number().positive().max(1000),
  rarity: z.enum(['common', 'rare', 'epic']),
});

// Balance validation
export const balanceSchema = z.number()
  .nonnegative('Balance cannot be negative')
  .finite('Invalid balance value')
  .max(1000000, 'Balance exceeds maximum');

// Nonce validation
export const nonceSchema = z.number()
  .int('Nonce must be an integer')
  .positive('Nonce must be positive')
  .max(Number.MAX_SAFE_INTEGER, 'Nonce too large');

// Mint request validation
export const mintRequestSchema = z.object({
  id: z.string().min(1),
  tier: tierSchema,
  timestamp: z.number().positive(),
  nonce: nonceSchema,
  userId: z.string().optional(),
});

// Validate and sanitize input
export const validateInput = <T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  errorMessage?: string
): T => {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.errors.map(e => e.message).join(', ');
      throw new Error(errorMessage || `Validation failed: ${messages}`);
    }
    throw error;
  }
};

// Safe number parsing
export const safeParseNumber = (value: unknown, defaultValue = 0): number => {
  const parsed = Number(value);
  if (isNaN(parsed) || !isFinite(parsed)) {
    return defaultValue;
  }
  return parsed;
};

// Sanitize for logging (remove sensitive data)
export const sanitizeForLogging = (data: any): any => {
  if (typeof data === 'string') {
    // Truncate long strings, hide potential addresses/hashes
    if (data.startsWith('account_') || data.length > 50) {
      return `${data.slice(0, 10)}...${data.slice(-4)}`;
    }
    return data;
  }
  
  if (Array.isArray(data)) {
    return data.map(sanitizeForLogging);
  }
  
  if (data && typeof data === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      // Skip sensitive fields
      if (['privateKey', 'secret', 'password', 'token'].includes(key)) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = sanitizeForLogging(value);
      }
    }
    return sanitized;
  }
  
  return data;
};
