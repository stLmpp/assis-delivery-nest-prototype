import { Body as NestBody } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';

import { generateSchema } from '../../common/generate-schema';

import { getZodDto, ZOD_DTO_SCHEMA } from './zod-dto';

export function Body(): ParameterDecorator {
  return (target, propertyKey, parameterIndex) => {
    const type = getZodDto(target, propertyKey!, parameterIndex);
    NestBody()(target, propertyKey, parameterIndex);
    ApiBody({
      schema: generateSchema(type[ZOD_DTO_SCHEMA]),
    })(
      target,
      propertyKey!,
      Reflect.getOwnPropertyDescriptor(target, propertyKey!)!,
    );
  };
}
