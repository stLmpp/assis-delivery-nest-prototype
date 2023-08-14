import { z } from 'zod';
import { zodDto } from '../core/zod/zod-dto';

const PostCitiesSchema = z.object({
  name: z.string().trim().nonempty().max(200),
});

export class PostCitiesDto extends zodDto(PostCitiesSchema) {}

const PostCitiesResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
});

export class PostCitiesResponse extends zodDto(PostCitiesResponseSchema) {}
