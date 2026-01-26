"use client";

import { useState, useEffect, useCallback } from "react";
import { supabaseClient } from "@/lib/supabaseClient";
import type {
  Businesses,
  BusinessesInsert,
  BusinessesUpdate,
  Sponsorships,
  Events,
  BusinessMemberships,
} from "@/types/database";

export interface BusinessWithDetails extends Businesses {
  sponsorships?: Sponsorships[];
  linkedEvents?: Events[];
  membership?: BusinessMemberships | null;
}

interface UseBusinessesOptions {
  autoFetch?: boolean;
  filters?: {
    search?: string;
    membershipId?: string;
    status?: "active" | "past" | "yet-to-support"; // Filter by sponsorship status
  };
}

interface UseBusinessesReturn {
  businesses: BusinessWithDetails[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  create: (data: BusinessesInsert) => Promise<Businesses | null>;
  update: (id: string, data: BusinessesUpdate) => Promise<Businesses | null>;
  delete: (id: string) => Promise<boolean>;
}

export function useBusinesses(options: UseBusinessesOptions = {}): UseBusinessesReturn {
  const { autoFetch = true, filters = {} } = options;
  const [businesses, setBusinesses] = useState<BusinessWithDetails[]>([]);
  const [loading, setLoading] = useState<boolean>(autoFetch);
  const [error, setError] = useState<string | null>(null);

  const fetchBusinesses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabaseClient.from("businesses").select("*");

      // Apply search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        query = query.or(
          `business_name.ilike.%${searchTerm}%,contact_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`
        );
      }

      // Apply membership filter
      if (filters.membershipId) {
        query = query.eq("membership_id", filters.membershipId);
      }

      const { data: businessesData, error: queryError } = await query.order("business_name", {
        ascending: true,
      });

      if (queryError) {
        throw queryError;
      }

      // Fetch sponsorships and events separately
      const businessIds = (businessesData || []).map((b) => b.id);

      let sponsorshipsMap = new Map<string, Sponsorships[]>();
      let eventsMap = new Map<string, Events>();
      let membershipsMap = new Map<string, BusinessMemberships>();

      if (businessIds.length > 0) {
        try {
          // Fetch sponsorships
          const { data: sponsorshipsData, error: sponsorshipsError } = await supabaseClient
            .from("sponsorships")
            .select("*")
            .in("business_id", businessIds);

          if (!sponsorshipsError && sponsorshipsData) {
            sponsorshipsData.forEach((sponsorship) => {
              if (sponsorship.business_id) {
                if (!sponsorshipsMap.has(sponsorship.business_id)) {
                  sponsorshipsMap.set(sponsorship.business_id, []);
                }
                sponsorshipsMap.get(sponsorship.business_id)!.push(sponsorship);
              }
            });
          }

          // Fetch event IDs from sponsorships
          const eventIds = Array.from(
            new Set(
              sponsorshipsData
                ?.map((s) => s.event_id)
                .filter((id): id is string => id !== null && id !== undefined) || []
            )
          );

          if (eventIds.length > 0) {
            const { data: eventsData, error: eventsError } = await supabaseClient
              .from("events")
              .select("*")
              .in("id", eventIds);

            if (!eventsError && eventsData) {
              eventsMap = new Map(eventsData.map((e) => [e.id, e]));
            }
          }

          // Fetch business memberships
          const membershipIds = (businessesData || [])
            .map((b) => b.membership_id)
            .filter((id): id is string => id !== null && id !== undefined);

          if (membershipIds.length > 0) {
            const { data: membershipsData, error: membershipsError } = await supabaseClient
              .from("business_memberships")
              .select("*")
              .in("id", membershipIds);

            if (!membershipsError && membershipsData) {
              membershipsMap = new Map(membershipsData.map((m) => [m.id, m]));
            }
          }
        } catch (joinErr) {
          console.warn("Error fetching related data:", joinErr);
          // Continue without related data
        }
      }

      // Transform data to include related information
      const transformedData: BusinessWithDetails[] = (businessesData || []).map((business) => {
        const sponsorships = sponsorshipsMap.get(business.id) || [];
        const linkedEvents = sponsorships
          .map((s) => (s.event_id ? eventsMap.get(s.event_id) : null))
          .filter((e): e is Events => e !== null && e !== undefined);
        const membership = business.membership_id
          ? membershipsMap.get(business.membership_id) || null
          : null;

        return {
          ...business,
          sponsorships,
          linkedEvents,
          membership,
        };
      });

      // Apply status filter if specified
      let filteredData = transformedData;
      if (filters.status) {
        filteredData = transformedData.filter((business) => {
          const sponsorships = business.sponsorships || [];
          if (filters.status === "active") {
            // Active: has active membership or recent paid sponsorships
            return (
              (business.membership && business.membership.status === "active") ||
              sponsorships.some((s) => s.status === "paid" && s.paid_date)
            );
          } else if (filters.status === "past") {
            // Past: has past sponsorships but not currently active
            return (
              sponsorships.length > 0 &&
              !(
                (business.membership && business.membership.status === "active") ||
                sponsorships.some((s) => s.status === "paid" && s.paid_date)
              )
            );
          } else if (filters.status === "yet-to-support") {
            // Yet to support: no sponsorships and no active membership
            return (
              sponsorships.length === 0 &&
              (!business.membership || business.membership.status !== "active")
            );
          }
          return true;
        });
      }

      setBusinesses(filteredData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch businesses";
      setError(errorMessage);
      console.error("Error fetching businesses:", err);
    } finally {
      setLoading(false);
    }
  }, [filters.search, filters.membershipId, filters.status]);

  const create = useCallback(async (data: BusinessesInsert): Promise<Businesses | null> => {
    try {
      setError(null);
      const { data: newBusiness, error: insertError } = await supabaseClient
        .from("businesses")
        .insert(data)
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      if (newBusiness) {
        setBusinesses((prev) => [...prev, newBusiness]);
      }

      return newBusiness;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create business";
      setError(errorMessage);
      console.error("Error creating business:", err);
      return null;
    }
  }, []);

  const update = useCallback(
    async (id: string, data: BusinessesUpdate): Promise<Businesses | null> => {
      try {
        setError(null);
        const { data: updatedBusiness, error: updateError } = await supabaseClient
          .from("businesses")
          .update(data)
          .eq("id", id)
          .select()
          .single();

        if (updateError) {
          throw updateError;
        }

        if (updatedBusiness) {
          setBusinesses((prev) => prev.map((b) => (b.id === id ? updatedBusiness : b)));
        }

        return updatedBusiness;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to update business";
        setError(errorMessage);
        console.error("Error updating business:", err);
        return null;
      }
    },
    []
  );

  const deleteBusiness = useCallback(async (id: string): Promise<boolean> => {
    try {
      setError(null);
      const { error: deleteError } = await supabaseClient.from("businesses").delete().eq("id", id);

      if (deleteError) {
        throw deleteError;
      }

      setBusinesses((prev) => prev.filter((b) => b.id !== id));
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete business";
      setError(errorMessage);
      console.error("Error deleting business:", err);
      return false;
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchBusinesses();
    }
  }, [autoFetch, fetchBusinesses]);

  return {
    businesses,
    loading,
    error,
    refetch: fetchBusinesses,
    create,
    update,
    delete: deleteBusiness,
  };
}
