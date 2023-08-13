import {
  bigint,
  bigserial,
  index,
  pgTable,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

export const CitiesSchema = pgTable('cities', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  name: text('name').notNull(),
});

export const UsersSchema = pgTable(
  'users',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    fullName: text('full_name').notNull(),
    phone: varchar('phone', { length: 20 }).notNull(),
    role: varchar('role', { enum: ['user', 'admin'] }).notNull(),
    cityId: bigint('city_id', {
      mode: 'number',
    }).references(() => CitiesSchema.id),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('created_at').defaultNow(),
  },
  () => ({
    cityIdIndex: index('city_id_index').on(UsersSchema.cityId),
  }),
);
