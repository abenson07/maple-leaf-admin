/**
 * Payments Schema
 * Based on Supabase schema
 */

export type PaymentTypeEnum = string; // public.payment_type_enum
export type PaymentMethodEnum = string; // public.payment_method_enum

export interface Payments {
  id: string; // uuid
  person_id: string | null; // uuid (references people)
  membership_id: string | null; // uuid (references memberships)
  amount: number; // numeric(10, 2), not null
  date: string; // date, not null
  memo: string | null; // text
  type: PaymentTypeEnum; // not null
  method: PaymentMethodEnum; // not null
  stripe_transaction_id: string | null; // text
}

export interface PaymentsInsert {
  person_id?: string | null;
  membership_id?: string | null;
  amount: number;
  date: string;
  memo?: string | null;
  type: PaymentTypeEnum;
  method: PaymentMethodEnum;
  stripe_transaction_id?: string | null;
}

export interface PaymentsUpdate {
  person_id?: string | null;
  membership_id?: string | null;
  amount?: number;
  date?: string;
  memo?: string | null;
  type?: PaymentTypeEnum;
  method?: PaymentMethodEnum;
  stripe_transaction_id?: string | null;
}
