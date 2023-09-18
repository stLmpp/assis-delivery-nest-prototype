import { Query } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';
import { ZodObject, ZodType } from 'zod';

import { generateSchema } from '../../common/generate-schema.js';

import { getZodDto, ZOD_DTO_SCHEMA } from './zod-dto.js';

export function QueryParams(): ParameterDecorator {
  return (target, propertyKey, parameterIndex) => {
    const type = getZodDto(target, propertyKey!, parameterIndex);
    const schema = type[ZOD_DTO_SCHEMA];
    if (!(schema instanceof ZodObject)) {
      throw new TypeError(
        `${type.name} cannot be used in the QueryParams decorator because it's not a ZodObject`,
      );
    }
    const schemaObject: ZodObject<Record<string, ZodType>> = schema;
    Query()(target, propertyKey, parameterIndex);
    const descriptor = Reflect.getOwnPropertyDescriptor(target, propertyKey!);
    for (const [key, value] of Object.entries(schemaObject.shape)) {
      ApiQuery({
        schema: generateSchema(value),
        name: key,
        required: !value.isOptional(),
      })(target, propertyKey!, descriptor!);
    }
  };
}
