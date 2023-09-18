import { Controller, Delete, Get, HttpStatus, Post } from '@nestjs/common';
import { eq } from 'drizzle-orm';

import { exception } from './core/exception/exception.js';
import { Exceptions } from './core/exception/exceptions.decorator.js';
import { Body } from './core/zod/body.decorator.js';
import { Params } from './core/zod/params.decorator.js';
import { Response } from './core/zod/response.decorator.js';
import { Drizzle } from './database/drizzle-orm.module.js';
import { GetCityParams } from './dto/get-city.dto.js';
import { PostCitiesDto, PostCitiesResponse } from './dto/post-cities.dto.js';
import { CitiesSchema } from './schemas.js';

const CITY_NOT_FOUND = exception({
  errorCode: '0001',
  status: HttpStatus.NOT_FOUND,
  error: 'City not found',
});

const CITY_NOT_FOUND2 = exception({
  errorCode: '0003',
  status: HttpStatus.NOT_FOUND,
  error: 'City not found',
});

const INTERNAL_SERVER_ERROR = exception({
  errorCode: '0002',
  status: HttpStatus.INTERNAL_SERVER_ERROR,
});

@Controller({
  version: '1',
  path: 'cities',
})
export class CitiesController {
  constructor(private readonly drizzle: Drizzle) {}

  @Response(PostCitiesResponse, 201)
  @Post()
  async postCity(@Body() body: PostCitiesDto): Promise<PostCitiesResponse> {
    const [entity] = await this.drizzle
      .insert(CitiesSchema)
      .values({
        name: body.name,
      })
      .returning();

    return entity;
  }

  @Response([PostCitiesResponse])
  @Get()
  async getAllCities(): Promise<PostCitiesResponse[]> {
    return this.drizzle.select().from(CitiesSchema);
  }

  @Delete(':idCity')
  async deleteCity(@Params() { idCity }: GetCityParams): Promise<void> {
    await this.drizzle.delete(CitiesSchema).where(eq(CitiesSchema.id, idCity));
  }

  @Exceptions([CITY_NOT_FOUND, INTERNAL_SERVER_ERROR, CITY_NOT_FOUND2])
  @Response(PostCitiesResponse)
  @Get(':idCity')
  async getCity(
    @Params() { idCity }: GetCityParams,
  ): Promise<PostCitiesResponse> {
    const [city] = await this.drizzle
      .select()
      .from(CitiesSchema)
      .where(eq(CitiesSchema.id, idCity));
    if (!city) {
      throw CITY_NOT_FOUND();
    }
    return city;
  }
}
