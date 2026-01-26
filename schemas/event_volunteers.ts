/**
 * Event Volunteers Schema
 * Based on Supabase schema
 */

export interface EventVolunteers {
  id: string; // uuid
  event_id: string | null; // uuid (references events)
  person_id: string | null; // uuid (references people)
  created_at: string | null; // timestamp with time zone
}

export interface EventVolunteersInsert {
  event_id?: string | null;
  person_id?: string | null;
  created_at?: string | null;
}

export interface EventVolunteersUpdate {
  event_id?: string | null;
  person_id?: string | null;
  created_at?: string | null;
}
