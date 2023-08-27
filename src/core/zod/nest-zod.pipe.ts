import { Paramtype } from '@nestjs/common/interfaces/features/paramtype.interface';
import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { formatZodErrorString } from '../../common/zod-error-formatter';
import {
  BAD_REQUEST_BODY,
  BAD_REQUEST_PARAMS,
  BAD_REQUEST_QUERY,
} from '../core-exceptions';
import { isZodDto, ZOD_DTO_SCHEMA } from './zod-dto';
import { ExceptionFactoryWithError } from '../exception/exception.type';

const PARAM_TYPES = new Set<Paramtype>(['param', 'body', 'query']);
const NEST_ZOD_PIPE_EXCEPTIONS: Record<Paramtype, ExceptionFactoryWithError> = {
  body: BAD_REQUEST_BODY,
  param: BAD_REQUEST_PARAMS,
  query: BAD_REQUEST_QUERY,
  custom: BAD_REQUEST_QUERY,
};

@Injectable()
export class NestZodPipe implements PipeTransform {
  async transform(
    value: unknown,
    { type, metatype }: ArgumentMetadata,
  ): Promise<unknown> {
    if (!PARAM_TYPES.has(type) || !isZodDto(metatype)) {
      return value;
    }
    const schema = metatype[ZOD_DTO_SCHEMA];
    const parsed = await schema.safeParseAsync(value);
    if (!parsed.success) {
      const exceptionFactory = NEST_ZOD_PIPE_EXCEPTIONS[type];
      console.log(parsed.error);
      throw exceptionFactory(formatZodErrorString(parsed.error));
    }
    return parsed.data;
  }
}
