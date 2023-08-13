import { z } from 'zod';
import {
  ParamBigIntSchema,
  ParamBooleanSchema,
  ParamDatetimeSchema,
  ParamDoubleSchema,
  ParamIntSchema,
} from '../common/common-schemas';
import { zodDto } from '../core/zod/zod-dto';

const PostCitiesSchema = z.object({
  name: z.string().trim().nonempty().max(200),
});

export class PostCitiesDto extends zodDto(PostCitiesSchema) {}

const PostCitiesResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  bigint: ParamBigIntSchema.optional(),
  int: ParamIntSchema.optional(),
  datetime: ParamDatetimeSchema.optional(),
  boolean: ParamBooleanSchema.optional(),
  double: ParamDoubleSchema.optional(),
});

export class PostCitiesResponse extends zodDto(PostCitiesResponseSchema) {}
