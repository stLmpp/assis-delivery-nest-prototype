import { z, ZodSchema } from 'zod';
import { HttpCode, HttpStatus, UseInterceptors } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { generateSchema } from '../../common/generate-schema';
import { nestZodInterceptorFactory } from './nest-zod-interceptor.factory';
import { ZOD_DTO_SCHEMA, ZodDto } from './zod-dto';

export function Response<T extends ZodSchema>(
  dto: ZodDto<T> | ZodDto<T>[],
  status = HttpStatus.OK,
): MethodDecorator {
  return (target, propertyKey, descriptor) => {
    const isArray = Array.isArray(dto);
    const single = isArray ? dto[0] : dto;
    const schema = single[ZOD_DTO_SCHEMA];
    const fullSchema = isArray ? z.array(schema) : schema;
    HttpCode(status);
    ApiResponse({
      content: {
        'application/json': {
          schema: generateSchema(schema, true),
        },
      },
      status,
      isArray,
    })(target, propertyKey, descriptor);
    UseInterceptors(nestZodInterceptorFactory(fullSchema))(
      target,
      propertyKey,
      descriptor,
    );
  };
}
