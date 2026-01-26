/**
 * Businesses Schema
 * Based on Supabase schema
 */

export interface Businesses {
  id: string; // uuid
  business_name: string | null; // text
  contact_name: string | null; // text
  email: string | null; // text
  phone: string | null; // text
  address: string | null; // text
  membership_id: string | null; // uuid (references business_memberships)
  notes: string | null; // text
}

export interface BusinessesInsert {
  business_name?: string | null;
  contact_name?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  membership_id?: string | null;
  notes?: string | null;
}

export interface BusinessesUpdate {
  business_name?: string | null;
  contact_name?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  membership_id?: string | null;
  notes?: string | null;
}
