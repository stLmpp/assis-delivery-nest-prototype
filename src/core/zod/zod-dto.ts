import { z, ZodSchema } from 'zod';

export const ZOD_DTO_SCHEMA = Symbol('Zod Dto Schema');

export interface ZodDto<T extends ZodSchema = ZodSchema> {
  new (): z.infer<T>;
  [ZOD_DTO_SCHEMA]: T;
}

export function zodDto<T extends ZodSchema>(schema: T): ZodDto<T> {
  class Dto {
    static [ZOD_DTO_SCHEMA] = schema;
  }
  return Dto;
}

export function isZodDto(value: unknown): value is ZodDto {
  return (
    !!value &&
    typeof value === 'function' &&
    ZOD_DTO_SCHEMA in value &&
    value[ZOD_DTO_SCHEMA] instanceof ZodSchema
  );
}

export function getZodDto(
  target: Object,
  propertyKey: string | symbol,
  parameterIndex: number,
): ZodDto {
  const type = Reflect.getMetadata('design:paramtypes', target, propertyKey)?.[
    parameterIndex
  ];
  if (!isZodDto(type)) {
    throw new Error(`${type?.name} is not a ZodDto`);
  }
  return type;
}
