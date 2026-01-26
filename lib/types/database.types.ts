/**
 * Database Types for MLCC Dashboard
 * 
 * This file defines TypeScript types that match the Supabase database schema.
 * These types are used throughout the application for type safety.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// ============================================================================
// PEOPLE TABLE
// ============================================================================

export interface People {
  id: string;
  full_name: string;
  email: string;
  address: string | null;
  created_at: string;
  updated_at: string;
}

export interface PeopleInsert {
  full_name: string;
  email: string;
  address?: string | null;
}

export interface PeopleUpdate {
  full_name?: string;
  email?: string;
  address?: string | null;
}

// ============================================================================
// MEMBERSHIPS TABLE
// ============================================================================

export type MembershipTier = "Gold" | "Silver" | "Bronze" | "Basic";
export type MembershipStatus = "active" | "expired" | "cancelled" | "pending";

export interface Memberships {
  id: string;
  person_id: string;
  tier: MembershipTier;
  status: MembershipStatus;
  last_renewal: string | null;
  created_at: string;
  updated_at: string;
}

export interface MembershipsInsert {
  person_id: string;
  tier: MembershipTier;
  status: MembershipStatus;
  last_renewal?: string | null;
}

export interface MembershipsUpdate {
  tier?: MembershipTier;
  status?: MembershipStatus;
  last_renewal?: string | null;
}

// ============================================================================
// ROUTES TABLE
// ============================================================================

export type RouteType = "Single family residence" | "Multi-family" | "Commercial" | "Mixed";
export type RouteStatus = "Scheduled" | "In Progress" | "Completed" | "Open";

export interface Routes {
  id: string;
  route_name: string;
  leaflets: number;
  dropoff_location: string;
  primary_deliverer_id: string | null;
  route_type: RouteType;
  route_status: RouteStatus;
  created_at: string;
  updated_at: string;
}

export interface RoutesInsert {
  route_name: string;
  leaflets: number;
  dropoff_location: string;
  primary_deliverer_id?: string | null;
  route_type: RouteType;
  route_status?: RouteStatus;
}

export interface RoutesUpdate {
  route_name?: string;
  leaflets?: number;
  dropoff_location?: string;
  primary_deliverer_id?: string | null;
  route_type?: RouteType;
  route_status?: RouteStatus;
}

// ============================================================================
// BUSINESSES TABLE
// ============================================================================

export type BusinessStatus = "activeMember" | "pastSponsor" | "yetToSupport";
export type SponsorshipTag = "Gold" | "Silver" | "Bronze" | "In-Kind";

export interface Businesses {
  id: string;
  name: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  website: string | null;
  status: BusinessStatus;
  member_since: string | null;
  sponsorship_tags: SponsorshipTag[] | null;
  linked_events: string[] | null; // Array of event IDs
  total_lifetime_sponsorship: number | null;
  created_at: string;
  updated_at: string;
}

export interface BusinessesInsert {
  name: string;
  contact_name?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  website?: string | null;
  status?: BusinessStatus;
  member_since?: string | null;
  sponsorship_tags?: SponsorshipTag[] | null;
  linked_events?: string[] | null;
  total_lifetime_sponsorship?: number | null;
}

export interface BusinessesUpdate {
  name?: string;
  contact_name?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  website?: string | null;
  status?: BusinessStatus;
  member_since?: string | null;
  sponsorship_tags?: SponsorshipTag[] | null;
  linked_events?: string[] | null;
  total_lifetime_sponsorship?: number | null;
}

// ============================================================================
// EVENTS TABLE (for future use)
// ============================================================================

export interface Events {
  id: string;
  event_name: string;
  event_date: string | null;
  location: string | null;
  attendees_count: number | null;
  volunteers_needed: number | null;
  created_at: string;
  updated_at: string;
}

export interface EventsInsert {
  event_name: string;
  event_date?: string | null;
  location?: string | null;
  attendees_count?: number | null;
  volunteers_needed?: number | null;
}

export interface EventsUpdate {
  event_name?: string;
  event_date?: string | null;
  location?: string | null;
  attendees_count?: number | null;
  volunteers_needed?: number | null;
}

// ============================================================================
// JOINED/VIEW TYPES
// ============================================================================

/**
 * Person with their membership information (for Neighbors page)
 */
export interface PersonWithMembership extends People {
  membership_id: string | null;
  membership_tier: MembershipTier | null;
  membership_status: MembershipStatus | null;
  last_renewal: string | null;
}

/**
 * Route with deliverer information
 */
export interface RouteWithDeliverer extends Routes {
  deliverer_name: string | null;
  deliverer_email: string | null;
  deliverer_address: string | null;
}

/**
 * Business with computed fields
 */
export interface BusinessWithDetails extends Businesses {
  // Additional computed fields can be added here
}
