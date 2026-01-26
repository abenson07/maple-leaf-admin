/**
 * People Schema
 * Based on Supabase schema
 */

export interface People {
  id: string; // uuid
  full_name: string; // text, not null
  email: string | null; // text, unique
  address: string | null; // text
  phone: string | null; // text
  roles: string[] | null; // text[]
  tags: string[] | null; // text[]
  source: string | null; // text
  created_at: string | null; // timestamp with time zone
  membership_id: string | null; // uuid (references memberships)
}

export interface PeopleInsert {
  full_name: string;
  email?: string | null;
  address?: string | null;
  phone?: string | null;
  roles?: string[] | null;
  tags?: string[] | null;
  source?: string | null;
  created_at?: string | null;
  membership_id?: string | null;
}

export interface PeopleUpdate {
  full_name?: string;
  email?: string | null;
  address?: string | null;
  phone?: string | null;
  roles?: string[] | null;
  tags?: string[] | null;
  source?: string | null;
  created_at?: string | null;
  membership_id?: string | null;
}