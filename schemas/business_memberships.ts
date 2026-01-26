/**
 * Business Memberships Schema
 * Based on Supabase schema
 */

import { MembershipStatusEnum } from "./memberships";

export interface BusinessMemberships {
  id: string; // uuid
  status: MembershipStatusEnum; // not null
  last_renewal: string; // date, not null
  payment_method: string | null; // text
  is_subscription: boolean | null; // default false
}

export interface BusinessMembershipsInsert {
  status: MembershipStatusEnum;
  last_renewal: string;
  payment_method?: string | null;
  is_subscription?: boolean | null;
}

export interface BusinessMembershipsUpdate {
  status?: MembershipStatusEnum;
  last_renewal?: string;
  payment_method?: string | null;
  is_subscription?: boolean | null;
}
