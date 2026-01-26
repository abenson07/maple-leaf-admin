"use client";

import { useState, useEffect, useCallback } from "react";
import { supabaseClient } from "@/lib/supabaseClient";
import type { People, PeopleInsert, PeopleUpdate, Memberships } from "@/types/database";

export interface PersonWithMembership extends People {
  membership?: Memberships | null;
}

interface UsePeopleOptions {
  autoFetch?: boolean;
  filters?: {
    search?: string;
    membershipId?: string;
    hasMembership?: boolean;
  };
}

interface UsePeopleReturn {
  people: PersonWithMembership[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  create: (data: PeopleInsert) => Promise<People | null>;
  update: (id: string, data: PeopleUpdate) => Promise<People | null>;
  delete: (id: string) => Promise<boolean>;
}

export function usePeople(options: UsePeopleOptions = {}): UsePeopleReturn {
  const { autoFetch = true, filters = {} } = options;
  const [people, setPeople] = useState<PersonWithMembership[]>([]);
  const [loading, setLoading] = useState<boolean>(autoFetch);
  const [error, setError] = useState<string | null>(null);

  const fetchPeople = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query for people
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

      // Filter by membership status
      if (filters.hasMembership !== undefined) {
        if (filters.hasMembership) {
          query = query.not("membership_id", "is", null);
        } else {
          query = query.is("membership_id", null);
        }
      }

      const { data: peopleData, error: queryError } = await query.order("full_name", {
        ascending: true,
      });

      if (queryError) {
        throw queryError;
      }

      // Fetch memberships separately and join
      const membershipIds = Array.from(
        new Set(
          (peopleData || [])
            .map((p) => p.membership_id)
            .filter((id): id is string => id !== null && id !== undefined)
        )
      );

      let membershipsMap = new Map<string, Memberships>();

      if (membershipIds.length > 0) {
        try {
          const { data: membershipsData, error: membershipsError } = await supabaseClient
            .from("memberships")
            .select("*")
            .in("id", membershipIds);

          if (membershipsError) {
            console.warn("Error fetching memberships:", membershipsError);
            // Don't throw - we can still return people without membership data
          } else if (membershipsData) {
            membershipsMap = new Map(
              membershipsData.map((m) => [m.id, m])
            );
          }
        } catch (membershipErr) {
          console.warn("Error fetching memberships:", membershipErr);
          // Continue without membership data
        }
      }

      // Transform data to match PersonWithMembership interface
      const transformedData: PersonWithMembership[] = (peopleData || []).map((person) => ({
        ...person,
        membership: person.membership_id ? membershipsMap.get(person.membership_id) || null : null,
      }));

      setPeople(transformedData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch people";
      setError(errorMessage);
      console.error("Error fetching people:", err);
    } finally {
      setLoading(false);
    }
  }, [filters.search, filters.membershipId, filters.hasMembership]);

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
