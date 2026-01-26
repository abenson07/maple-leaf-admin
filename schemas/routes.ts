/**
 * Routes Schema
 * Based on Supabase schema
 */

export type RouteTypesEnum = string; // public.Route Types

export interface Routes {
  id: string; // uuid
  route_name: string; // text, not null
  leaflet_count: number | null; // integer
  created_at: string | null; // timestamp with time zone
  route_type: RouteTypesEnum | null;
  primary_deliverer_id: string | null; // uuid (references people)
  secondary_deliverer_id: string | null; // uuid (references people)
  is_skipped: boolean | null; // default false
  primary_deliverer_email: string | null; // text
}

export interface RoutesInsert {
  route_name: string;
  leaflet_count?: number | null;
  created_at?: string | null;
  route_type?: RouteTypesEnum | null;
  primary_deliverer_id?: string | null;
  secondary_deliverer_id?: string | null;
  is_skipped?: boolean | null;
  primary_deliverer_email?: string | null;
}

export interface RoutesUpdate {
  route_name?: string;
  leaflet_count?: number | null;
  created_at?: string | null;
  route_type?: RouteTypesEnum | null;
  primary_deliverer_id?: string | null;
  secondary_deliverer_id?: string | null;
  is_skipped?: boolean | null;
  primary_deliverer_email?: string | null;
}
