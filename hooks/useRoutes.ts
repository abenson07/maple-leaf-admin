"use client";

import { useState, useEffect, useCallback } from "react";
import { supabaseClient } from "@/lib/supabaseClient";
import type { Routes, RoutesInsert, RoutesUpdate, People } from "@/types/database";

export interface RouteWithDeliverer extends Routes {
  primary_deliverer?: People | null;
  secondary_deliverer?: People | null;
}

interface UseRoutesOptions {
  autoFetch?: boolean;
  filters?: {
    search?: string;
    delivererId?: string;
    routeType?: string;
    isSkipped?: boolean;
    hasDeliverer?: boolean; // true = has deliverer, false = no deliverer
  };
}

interface UseRoutesReturn {
  routes: RouteWithDeliverer[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  create: (data: RoutesInsert) => Promise<Routes | null>;
  update: (id: string, data: RoutesUpdate) => Promise<Routes | null>;
  delete: (id: string) => Promise<boolean>;
}

export function useRoutes(options: UseRoutesOptions = {}): UseRoutesReturn {
  const { autoFetch = true, filters = {} } = options;
  const [routes, setRoutes] = useState<RouteWithDeliverer[]>([]);
  const [loading, setLoading] = useState<boolean>(autoFetch);
  const [error, setError] = useState<string | null>(null);

  const fetchRoutes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabaseClient.from("routes").select("*");

      // Apply search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        query = query.or(
          `route_name.ilike.%${searchTerm}%,primary_deliverer_email.ilike.%${searchTerm}%`
        );
      }

      // Apply deliverer filter
      if (filters.delivererId) {
        query = query.or(
          `primary_deliverer_id.eq.${filters.delivererId},secondary_deliverer_id.eq.${filters.delivererId}`
        );
      }

      // Filter by whether route has a deliverer
      if (filters.hasDeliverer !== undefined) {
        if (filters.hasDeliverer) {
          query = query.not("primary_deliverer_id", "is", null);
        } else {
          query = query.is("primary_deliverer_id", null);
        }
      }

      // Apply route type filter
      if (filters.routeType) {
        query = query.eq("route_type", filters.routeType);
      }

      // Apply skipped filter
      if (filters.isSkipped !== undefined) {
        query = query.eq("is_skipped", filters.isSkipped);
      }

      const { data: routesData, error: queryError } = await query.order("route_name", {
        ascending: true,
      });

      if (queryError) {
        throw queryError;
      }

      // Fetch deliverer data separately and join
      const delivererIds = new Set<string>();
      (routesData || []).forEach((route) => {
        if (route.primary_deliverer_id) delivererIds.add(route.primary_deliverer_id);
        if (route.secondary_deliverer_id) delivererIds.add(route.secondary_deliverer_id);
      });

      let deliverersMap = new Map<string, People>();

      if (delivererIds.size > 0) {
        try {
          const { data: deliverersData, error: deliverersError } = await supabaseClient
            .from("people")
            .select("*")
            .in("id", Array.from(delivererIds));

          if (deliverersError) {
            console.warn("Error fetching deliverers:", deliverersError);
          } else if (deliverersData) {
            deliverersMap = new Map(deliverersData.map((p) => [p.id, p]));
          }
        } catch (delivererErr) {
          console.warn("Error fetching deliverers:", delivererErr);
        }
      }

      // Transform data to include deliverer information
      const transformedData: RouteWithDeliverer[] = (routesData || []).map((route) => ({
        ...route,
        primary_deliverer: route.primary_deliverer_id
          ? deliverersMap.get(route.primary_deliverer_id) || null
          : null,
        secondary_deliverer: route.secondary_deliverer_id
          ? deliverersMap.get(route.secondary_deliverer_id) || null
          : null,
      }));

      setRoutes(transformedData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch routes";
      setError(errorMessage);
      console.error("Error fetching routes:", err);
    } finally {
      setLoading(false);
    }
  }, [filters.search, filters.delivererId, filters.routeType, filters.isSkipped, filters.hasDeliverer]);

  const create = useCallback(async (data: RoutesInsert): Promise<Routes | null> => {
    try {
      setError(null);
      const { data: newRoute, error: insertError } = await supabaseClient
        .from("routes")
        .insert(data)
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      if (newRoute) {
        setRoutes((prev) => [...prev, newRoute]);
      }

      return newRoute;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create route";
      setError(errorMessage);
      console.error("Error creating route:", err);
      return null;
    }
  }, []);

  const update = useCallback(async (id: string, data: RoutesUpdate): Promise<Routes | null> => {
    try {
      setError(null);
      const { data: updatedRoute, error: updateError } = await supabaseClient
        .from("routes")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      if (updatedRoute) {
        setRoutes((prev) => prev.map((r) => (r.id === id ? updatedRoute : r)));
      }

      return updatedRoute;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update route";
      setError(errorMessage);
      console.error("Error updating route:", err);
      return null;
    }
  }, []);

  const deleteRoute = useCallback(async (id: string): Promise<boolean> => {
    try {
      setError(null);
      const { error: deleteError } = await supabaseClient.from("routes").delete().eq("id", id);

      if (deleteError) {
        throw deleteError;
      }

      setRoutes((prev) => prev.filter((r) => r.id !== id));
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete route";
      setError(errorMessage);
      console.error("Error deleting route:", err);
      return false;
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchRoutes();
    }
  }, [autoFetch, fetchRoutes]);

  return {
    routes,
    loading,
    error,
    refetch: fetchRoutes,
    create,
    update,
    delete: deleteRoute,
  };
}
