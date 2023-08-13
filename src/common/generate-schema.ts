import { ZodSchema } from 'zod';
import { generateSchema as zodOpenapiGenerateSchema } from '@anatine/zod-openapi';

export function generateSchema(schema: ZodSchema, useOutput = false): any {
  return zodOpenapiGenerateSchema(schema, useOutput);
}
