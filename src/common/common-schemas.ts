import { z } from 'zod';

export const ParamIntSchema = z
  .string()
  .trim()
  .nonempty()
  .regex(/^-?\d+$/, 'Must be an integer')
  .transform(Number)
  .pipe(z.number().int().safe());

export const ParamBigIntSchema = z
  .string()
  .trim()
  .nonempty()
  .regex(/^-?\d+$/, 'Must be an integer')
  .transform(BigInt)
  .pipe(z.bigint());

export const ParamDoubleSchema = z
  .string()
  .trim()
  .nonempty()
  .regex(/^-?\d+(\.\d+)$/, 'Must be a double')
  .transform(Number)
  .pipe(z.number());

export const ParamBooleanSchema = z
  .string()
  .trim()
  .pipe(z.enum(['true', 'false', '']))
  .transform((value) => value === '' || value === 'true')
  .pipe(z.boolean());

export const ParamDatetimeSchema = z
  .string()
  .datetime()
  .transform((datetime) => new Date(datetime))
  .pipe(z.date());
