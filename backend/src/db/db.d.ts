import type { ColumnType } from "kysely";

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;

export type Json = ColumnType<JsonValue, string, string>;

export type JsonArray = JsonValue[];

export type JsonObject = {
  [K in string]?: JsonValue;
};

export type JsonPrimitive = boolean | number | string | null;

export type JsonValue = JsonArray | JsonObject | JsonPrimitive;

export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export interface ReservationSnipe {
  city: string;
  created_at: Generated<Timestamp>;
  id: Generated<string>;
  party_size: number;
  preferred_seat_type: string | null;
  preferred_times: Json;
  reservation_date: Timestamp;
  reservation_token: string | null;
  restaurant_id: number;
  snipe_time: Timestamp;
  updated_at: Generated<Timestamp>;
  user_id: number;
}

export interface DB {
  reservation_snipe: ReservationSnipe;
}
