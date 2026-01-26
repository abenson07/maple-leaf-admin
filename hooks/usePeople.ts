"use client";

import { useState, useEffect, useCallback } from "react";
import { supabaseClient } from "@/lib/supabaseClient";
import type { People, PeopleInsert, PeopleUpdate } from "@/types/database";

interface UsePeopleOptions {
  autoFetch?: boolean;
  filters?: {
    search?: string;
    membershipId?: string;
  };
}

interface UsePeopleReturn {
  people: People[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  create: (data: PeopleInsert) => Promise<People | null>;
  update: (id: string, data: PeopleUpdate) => Promise<People | null>;
  delete: (id: string) => Promise<boolean>;
}

export function usePeople(options: UsePeopleOptions = {}): UsePeopleReturn {
  const { autoFetch = true, filters = {} } = options;
  const [people, setPeople] = useState<People[]>([]);
  const [loading, setLoading] = useState<boolean>(autoFetch);
  const [error, setError] = useState<string | null>(null);

  const fetchPeople = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabaseClient.from("people").select("*");

      // Apply search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        query = query.or(
          `full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,address.ilike.%${searchTerm}%`
        );
      }

      // Apply membership filter
      if (filters.membershipId) {
        query = query.eq("membership_id", filters.membershipId);
      }

      const { data, error: queryError } = await query.order("full_name", {
        ascending: true,
      });

      if (queryError) {
        throw queryError;
      }

      setPeople(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch people";
      setError(errorMessage);
      console.error("Error fetching people:", err);
    } finally {
      setLoading(false);
    }
  }, [filters.search, filters.membershipId]);

  const create = useCallback(async (data: PeopleInsert): Promise<People | null> => {
    try {
      setError(null);
      const { data: newPerson, error: insertError } = await supabaseClient
        .from("people")
        .insert(data)
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      if (newPerson) {
        setPeople((prev) => [...prev, newPerson]);
      }

      return newPerson;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create person";
      setError(errorMessage);
      console.error("Error creating person:", err);
      return null;
    }
  }, []);

  const update = useCallback(async (id: string, data: PeopleUpdate): Promise<People | null> => {
    try {
      setError(null);
      const { data: updatedPerson, error: updateError } = await supabaseClient
        .from("people")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      if (updatedPerson) {
        setPeople((prev) => prev.map((p) => (p.id === id ? updatedPerson : p)));
      }

      return updatedPerson;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update person";
      setError(errorMessage);
      console.error("Error updating person:", err);
      return null;
    }
  }, []);

  const deletePerson = useCallback(async (id: string): Promise<boolean> => {
    try {
      setError(null);
      const { error: deleteError } = await supabaseClient.from("people").delete().eq("id", id);

      if (deleteError) {
        throw deleteError;
      }

      setPeople((prev) => prev.filter((p) => p.id !== id));
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete person";
      setError(errorMessage);
      console.error("Error deleting person:", err);
      return false;
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchPeople();
    }
  }, [autoFetch, fetchPeople]);

  return {
    people,
    loading,
    error,
    refetch: fetchPeople,
    create,
    update,
    delete: deletePerson,
  };
}
