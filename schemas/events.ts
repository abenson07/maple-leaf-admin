/**
 * Events Schema
 * Based on Supabase schema
 */

export interface Events {
  id: string; // uuid
  name: string | null; // text
  date: string | null; // date
}

export interface EventsInsert {
  name?: string | null;
  date?: string | null;
}

export interface EventsUpdate {
  name?: string | null;
  date?: string | null;
}
