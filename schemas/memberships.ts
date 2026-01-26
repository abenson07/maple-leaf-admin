/**
 * Memberships Schema
 * Based on Supabase schema
 */

export type MembershipTierEnum = string; // public.membership_tier_enum
export type MembershipStatusEnum = string; // public.membership_status_enum

export interface Memberships {
  id: string; // uuid
  tier: MembershipTierEnum | null;
  status: MembershipStatusEnum | null;
  last_renewal: string | null; // date
  payment_method: string | null; // text
  is_subscription: boolean | null; // default false
  start_date: string | null; // date
  stripe_customer_id: string | null; // text
  stripe_subscription_id: string | null; // text
  stripe_tier_id: string | null; // text
  customer_email: string | null; // text
  created_at: string | null; // timestamp with time zone
}

export interface MembershipsInsert {
  tier?: MembershipTierEnum | null;
  status?: MembershipStatusEnum | null;
  last_renewal?: string | null;
  payment_method?: string | null;
  is_subscription?: boolean | null;
  start_date?: string | null;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  stripe_tier_id?: string | null;
  customer_email?: string | null;
  created_at?: string | null;
}

export interface MembershipsUpdate {
  tier?: MembershipTierEnum | null;
  status?: MembershipStatusEnum | null;
  last_renewal?: string | null;
  payment_method?: string | null;
  is_subscription?: boolean | null;
  start_date?: string | null;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  stripe_tier_id?: string | null;
  customer_email?: string | null;
  created_at?: string | null;
}
