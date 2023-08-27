import { exception } from './exception';
import { HttpStatus } from '@nestjs/common';

export const BAD_REQUEST_BODY = exception({
  status: HttpStatus.BAD_REQUEST,
  errorCode: 'CORE-0001',
  message: 'The request body has invalid data',
});
export const BAD_REQUEST_QUERY = exception({
  status: HttpStatus.BAD_REQUEST,
  errorCode: 'CORE-0002',
  message: 'The request query has invalid data',
});
export const BAD_REQUEST_PARAMS = exception({
  status: HttpStatus.BAD_REQUEST,
  errorCode: 'CORE-0003',
  message: 'The request params has invalid data',
});
export const UNKNOWN_INTERNAL_SERVER_ERROR = exception({
  status: HttpStatus.INTERNAL_SERVER_ERROR,
  errorCode: 'CORE-0005',
  error: 'An unknown internal server error occurred',
});
export const TOO_MANY_REQUESTS = exception({
  status: HttpStatus.TOO_MANY_REQUESTS,
  error: 'Too Many Requests',
  errorCode: 'CORE-0006',
});
export const ROUTE_NOT_FOUND = exception({
  status: HttpStatus.NOT_FOUND,
  errorCode: 'CORE-0007',
});
export const INVALID_RESPONSE = exception({
  status: HttpStatus.INTERNAL_SERVER_ERROR,
  errorCode: 'CORE-0008',
  message:
    'Our server replied with the wrong response. Please contact the support.',
});
