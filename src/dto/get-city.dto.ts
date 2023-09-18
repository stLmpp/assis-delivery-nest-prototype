import { z } from 'zod';

import { ParamIntSchema } from '../common/common-schemas.js';
import { zodDto } from '../core/zod/zod-dto.js';

const GetCitySchema = z.object({
  idCity: ParamIntSchema,
});

export class GetCityParams extends zodDto(GetCitySchema) {}
