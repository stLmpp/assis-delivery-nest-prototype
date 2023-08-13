import { z } from 'zod';
import {
  ParamBigIntSchema,
  ParamBooleanSchema,
  ParamDatetimeSchema,
  ParamDoubleSchema,
  ParamIntSchema,
} from '../common/common-schemas';
import { zodDto } from '../core/zod/zod-dto';

const GetCitySchema = z.object({
  idCity: ParamIntSchema,
  bigint: ParamBigIntSchema.optional(),
  int: ParamIntSchema.optional(),
  datetime: ParamDatetimeSchema.optional(),
  boolean: ParamBooleanSchema.optional(),
  double: ParamDoubleSchema.optional(),
});

export class GetCityParams extends zodDto(GetCitySchema) {}
