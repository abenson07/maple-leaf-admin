/**
 * Sponsorships Schema
 * Based on Supabase schema
 */

export type SponsorshipStatus = "pledged" | "invoiced" | "paid";

export interface Sponsorships {
  business_id: string | null; // uuid (references businesses)
  event_id: string | null; // uuid (references events)
  amount: number | null; // numeric(10, 2)
  status: SponsorshipStatus | null; // text (check constraint)
  memo: string | null; // text
  paid_date: string | null; // date
}

export interface SponsorshipsInsert {
  business_id?: string | null;
  event_id?: string | null;
  amount?: number | null;
  status?: SponsorshipStatus | null;
  memo?: string | null;
  paid_date?: string | null;
}

export interface SponsorshipsUpdate {
  business_id?: string | null;
  event_id?: string | null;
  amount?: number | null;
  status?: SponsorshipStatus | null;
  memo?: string | null;
  paid_date?: string | null;
}
