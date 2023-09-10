import { Test } from '@nestjs/testing';
import { mock } from 'vitest-mock-extended';

import { CitiesController } from './cities.controller';
import { Drizzle } from './database/drizzle-orm.module';

describe('CitiesController', () => {
  let controller: CitiesController;

  const drizzleMock = mock<Drizzle>();

  beforeEach(async () => {
    const testBed = await Test.createTestingModule({
      controllers: [CitiesController],
      providers: [{ provide: Drizzle, useValue: drizzleMock }],
    }).compile();
    controller = testBed.get(CitiesController);
  });

  it('should create instance', () => {
    expect(controller).toBeDefined();
  });
});
