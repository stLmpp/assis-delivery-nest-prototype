import { z } from 'zod';

export const ExceptionSchema = z.object({
  status: z.number(),
  message: z.string(),
  error: z.string(),
  errorCode: z.string(),
  correlationId: z.string().uuid(),
});
