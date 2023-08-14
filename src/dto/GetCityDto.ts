import { z } from 'zod';
import { ParamIntSchema } from '../common/common-schemas';
import { zodDto } from '../core/zod/zod-dto';

const GetCitySchema = z.object({
  idCity: ParamIntSchema,
});

export class GetCityParams extends zodDto(GetCitySchema) {}
