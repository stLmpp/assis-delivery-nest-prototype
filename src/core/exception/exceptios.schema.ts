import { z } from 'zod';

export const ExceptionSchema = z.object({
  status: z.number().min(400).max(599),
  message: z.string().nonempty(),
  error: z.string(),
  errorCode: z.string().nonempty().min(4),
  correlationId: z.string().uuid(),
});
