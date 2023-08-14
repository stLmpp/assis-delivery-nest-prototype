import { Controller, Get, HttpStatus, Post } from '@nestjs/common';
import { Drizzle } from './database/drizzle-orm.module';
import { PostCitiesDto, PostCitiesResponse } from './dto/PostCitiesDto';
import { CitiesSchema } from './schemas';
import { GetCityParams } from './dto/GetCityDto';
import { eq } from 'drizzle-orm';
import { exception, Exceptions } from './core/exception';
import { Response } from './core/zod/response.decorator';
import { Params } from './core/zod/params.decorator';
import { Body } from './core/zod/body.decorator';

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
    return {
      ...city,
      id: '123',
    } as any;
  }
}
