"use client";

import { useState, useEffect, useCallback } from "react";
import { supabaseClient } from "@/lib/supabaseClient";
import type { Businesses, BusinessesInsert, BusinessesUpdate } from "@/types/database";

interface UseBusinessesOptions {
  autoFetch?: boolean;
  filters?: {
    search?: string;
    membershipId?: string;
  };
}

interface UseBusinessesReturn {
  businesses: Businesses[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  create: (data: BusinessesInsert) => Promise<Businesses | null>;
  update: (id: string, data: BusinessesUpdate) => Promise<Businesses | null>;
  delete: (id: string) => Promise<boolean>;
}

export function useBusinesses(options: UseBusinessesOptions = {}): UseBusinessesReturn {
  const { autoFetch = true, filters = {} } = options;
  const [businesses, setBusinesses] = useState<Businesses[]>([]);
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

      const { data, error: queryError } = await query.order("business_name", {
        ascending: true,
      });

      if (queryError) {
        throw queryError;
      }

      setBusinesses(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch businesses";
      setError(errorMessage);
      console.error("Error fetching businesses:", err);
    } finally {
      setLoading(false);
    }
  }, [filters.search, filters.membershipId]);

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
