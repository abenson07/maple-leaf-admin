/**
 * Deliveries Schema
 * Based on Supabase schema
 */

export interface Deliveries {
  id: string; // uuid
  person_id: string; // uuid, not null (references people)
  route_id: string; // uuid, not null (references routes)
  date_delivered: string; // date, not null
}

export interface DeliveriesInsert {
  person_id: string;
  route_id: string;
  date_delivered: string;
}

export interface DeliveriesUpdate {
  person_id?: string;
  route_id?: string;
  date_delivered?: string;
}
