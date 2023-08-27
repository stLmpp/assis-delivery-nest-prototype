import { ExceptionFactory } from './exception.type';
import { arrayUniqBy } from '../../common/array-uniq-by';
import { ExamplesObject } from 'openapi3-ts/oas31';
import { ApiResponse } from '@nestjs/swagger';
import { generateSchema } from '../../common/generate-schema';
import { ExceptionSchema } from './exceptios.schema';
import { getReasonPhrase } from 'http-status-codes';
import { randomUUID } from 'node:crypto';

const CORRELATION_ID_EXAMPLE = randomUUID();

export function Exceptions(factories: ExceptionFactory[]): MethodDecorator {
  const exceptions = factories.map((exception) => exception(''));
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
