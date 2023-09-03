import { CitiesController } from './cities.controller';
import { Test, TestingModule } from '@nestjs/testing';
import { mock } from 'vitest-mock-extended';
import { Drizzle } from './database/drizzle-orm.module';

describe('CitiesController', () => {
  let controller: CitiesController;

  const drizzleMock = mock<Drizzle>();

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [CitiesController],
      providers: [{ provide: Drizzle, useValue: drizzleMock }],
    }).compile();
    controller = moduleRef.get(CitiesController);
  });

  it('should create instance', () => {
    expect(controller).toBeDefined();
  });
});
