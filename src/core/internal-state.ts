import { AsyncLocalStorage } from 'node:async_hooks';
import { randomUUID } from 'node:crypto';

import { HttpStatus } from '@nestjs/common';
import { RequestHandler } from 'express';

import { exception } from './exception/exception';

const INTERNAL_STATE_OUT_OF_CONTEXT = () =>
  exception({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    errorCode: 'CORE-0004',
    error:
      'Could not get internal state, make sure your function is running in the context',
  });

export interface InternalState {
  correlationId: string;
}

const ASYNC_LOCAL_STORAGE = new AsyncLocalStorage<InternalState>();

export function createCorrelationId(): string {
  return randomUUID();
}

export function getCorrelationId(): string {
  const state = ASYNC_LOCAL_STORAGE.getStore();
  if (!state) {
    throw INTERNAL_STATE_OUT_OF_CONTEXT()();
  }
  return state.correlationId;
}

export function runInContext<T>(
  run: () => T | Promise<T>,
  partialState: Partial<InternalState> = {},
): Promise<T> | T {
  const initialState: InternalState = {
    correlationId: partialState.correlationId ?? createCorrelationId(),
  };
  return ASYNC_LOCAL_STORAGE.run(initialState, run);
}

export function internalStateMiddleware(): RequestHandler {
  return async (request, response, next) => {
    const correlationIdHeaderRaw = request.get('x-correlation-id');
    const correlationIdHeader = correlationIdHeaderRaw?.length
      ? correlationIdHeaderRaw
      : undefined;
    const correlationIdQueryRaw = request.query['correlationId'];
    const correlationIdQuery =
      typeof correlationIdQueryRaw === 'string' && correlationIdQueryRaw.length
        ? correlationIdQueryRaw
        : undefined;
    const correlationId =
      correlationIdHeader ?? correlationIdQuery ?? createCorrelationId();
    response.setHeader('x-correlation-id', correlationId);
    runInContext(
      () => {
        next();
      },
      {
        correlationId,
      },
    );
  };
}
