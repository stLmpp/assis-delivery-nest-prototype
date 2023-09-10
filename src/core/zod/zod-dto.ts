import { z, ZodSchema } from 'zod';

export const ZOD_DTO_SCHEMA = Symbol('Zod Dto Schema');

export interface ZodDto<T extends ZodSchema = ZodSchema> {
  new (): z.infer<T>;
}

export interface ZodDtoInternal<T extends ZodSchema = ZodSchema>
  extends ZodDto<T> {
  readonly [ZOD_DTO_SCHEMA]: T;
}

export function zodDto<T extends ZodSchema>(schema: T): ZodDto<T> {
  class Dto {
    static readonly [ZOD_DTO_SCHEMA] = schema;
  }
  return Dto;
}

export function isZodDto(value: unknown): value is ZodDtoInternal {
  return (
    !!value &&
    typeof value === 'function' &&
    ZOD_DTO_SCHEMA in value &&
    value[ZOD_DTO_SCHEMA] instanceof ZodSchema
  );
}

export function getZodDto(
  target: NonNullable<unknown>,
  propertyKey: string | symbol,
  parameterIndex: number,
): ZodDtoInternal {
  const type = Reflect.getMetadata('design:paramtypes', target, propertyKey)?.[
    parameterIndex
  ];
  if (!isZodDto(type)) {
    throw new Error(`${type?.name} is not a ZodDto`);
  }
  return type;
}
