import { randomUUID } from 'node:crypto';

import { ApiResponse } from '@nestjs/swagger';
import { getReasonPhrase } from 'http-status-codes';
import { ExamplesObject } from 'openapi3-ts/oas31';

import { arrayUniqBy } from '../../common/array-uniq-by';
import { generateSchema } from '../../common/generate-schema';

import * as CoreExceptions from './core-exceptions';
import { ExceptionFactory } from './exception.type';
import { ExceptionSchema } from './exceptios.schema';

const CORRELATION_ID_EXAMPLE = randomUUID();

export function Exceptions(factories: ExceptionFactory[]): MethodDecorator {
  const exceptions = [...factories, ...Object.values(CoreExceptions)].map(
    (exception) => exception(''),
  );
  return (target, propertyKey, descriptor) => {
    const statusList = arrayUniqBy(exceptions, (exception) =>
      exception.getStatus(),
    ).map((exception) => exception.getStatus());
    for (const status of statusList) {
      const exceptionsStatus = exceptions.filter(
        (exception) => exception.getStatus() === status,
      );
      const examples: ExamplesObject = {};
      for (const exception of exceptionsStatus) {
        examples[exception.errorCode] = {
          value: {
            ...exception.toJSON(),
            correlationId: CORRELATION_ID_EXAMPLE,
          },
          description: exception.description,
        };
      }
      ApiResponse({
        status,
        content: {
          'application/json': {
            schema: generateSchema(ExceptionSchema),
            examples,
          },
        },
        description: getReasonPhrase(status),
      })(target, propertyKey, descriptor);
    }
  };
}
