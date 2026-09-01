import { z } from 'zod';

export const errorCodeSchema = z.enum(['INTERNAL_ERROR', 'NOT_FOUND']);
export type ErrorCode = z.infer<typeof errorCodeSchema>;

export const errorResponseSchema = z.object({
  error: z.object({
    code: errorCodeSchema,
    message: z.string(),
    details: z.unknown().optional(),
  }),
});
export type ErrorResponse = z.infer<typeof errorResponseSchema>;

export const healthResponseSchema = z.object({
  ok: z.literal(true),
  version: z.string().min(1),
});
export type HealthResponse = z.infer<typeof healthResponseSchema>;
