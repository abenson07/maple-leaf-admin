"use client";

import { useState, useEffect, useCallback } from "react";
import { supabaseClient } from "@/lib/supabaseClient";

export interface DashboardMetrics {
  totalMembers: number;
  activeMemberships: number;
  totalRevenue: number;
  membershipRevenue: number;
  otherRevenue: number;
  newMembersThisMonth: number;
  renewalsThisMonth: number;
  monthlyBreakdown: MonthlyMetrics[];
}

export interface MonthlyMetrics {
  month: string; // YYYY-MM format
  totalRevenue: number;
  membershipRevenue: number;
  otherRevenue: number;
  newMembers: number;
  renewals: number;
}

interface UseDashboardReturn {
  metrics: DashboardMetrics | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useDashboard(): UseDashboardReturn {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch memberships
      const { data: memberships, error: membershipsError } = await supabaseClient
        .from("memberships")
        .select("id, status, start_date, last_renewal");

      if (membershipsError) {
        throw membershipsError;
      }

      // Fetch payments
      const { data: payments, error: paymentsError } = await supabaseClient
        .from("payments")
        .select("amount, date, type");

      if (paymentsError) {
        throw paymentsError;
      }

      // Calculate metrics
      const totalMembers = memberships?.length || 0;
      const activeMemberships =
        memberships?.filter((m) => m.status === "active" || m.status === "Active").length || 0;

      const now = new Date();
      const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
      const currentYear = now.getFullYear();
      const currentMonthNum = now.getMonth() + 1;

      // Calculate revenue
      const allPayments = payments || [];
      const totalRevenue = allPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
      const membershipRevenue = allPayments
        .filter((p) => p.type === "membership" || p.type === "Membership")
        .reduce((sum, p) => sum + Number(p.amount || 0), 0);
      const otherRevenue = totalRevenue - membershipRevenue;

      // Calculate monthly metrics
      const newMembersThisMonth =
        memberships?.filter((m) => {
          if (!m.start_date) return false;
          const startDate = new Date(m.start_date);
          return (
            startDate.getFullYear() === currentYear &&
            startDate.getMonth() + 1 === currentMonthNum
          );
        }).length || 0;

      const renewalsThisMonth =
        memberships?.filter((m) => {
          if (!m.last_renewal) return false;
          const renewalDate = new Date(m.last_renewal);
          return (
            renewalDate.getFullYear() === currentYear &&
            renewalDate.getMonth() + 1 === currentMonthNum
          );
        }).length || 0;

      // Calculate monthly breakdown (last 12 months)
      const monthlyBreakdown: MonthlyMetrics[] = [];
      for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        const year = date.getFullYear();
        const monthNum = date.getMonth() + 1;

        const monthPayments = allPayments.filter((p) => {
          if (!p.date) return false;
          const paymentDate = new Date(p.date);
          return paymentDate.getFullYear() === year && paymentDate.getMonth() + 1 === monthNum;
        });

        const monthTotalRevenue = monthPayments.reduce(
          (sum, p) => sum + Number(p.amount || 0),
          0
        );
        const monthMembershipRevenue = monthPayments
          .filter((p) => p.type === "membership" || p.type === "Membership")
          .reduce((sum, p) => sum + Number(p.amount || 0), 0);
        const monthOtherRevenue = monthTotalRevenue - monthMembershipRevenue;

        const monthNewMembers =
          memberships?.filter((m) => {
            if (!m.start_date) return false;
            const startDate = new Date(m.start_date);
            return startDate.getFullYear() === year && startDate.getMonth() + 1 === monthNum;
          }).length || 0;

        const monthRenewals =
          memberships?.filter((m) => {
            if (!m.last_renewal) return false;
            const renewalDate = new Date(m.last_renewal);
            return renewalDate.getFullYear() === year && renewalDate.getMonth() + 1 === monthNum;
          }).length || 0;

        monthlyBreakdown.push({
          month,
          totalRevenue: monthTotalRevenue,
          membershipRevenue: monthMembershipRevenue,
          otherRevenue: monthOtherRevenue,
          newMembers: monthNewMembers,
          renewals: monthRenewals,
        });
      }

      setMetrics({
        totalMembers,
        activeMemberships,
        totalRevenue,
        membershipRevenue,
        otherRevenue,
        newMembersThisMonth,
        renewalsThisMonth,
        monthlyBreakdown,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch dashboard metrics";
      setError(errorMessage);
      console.error("Error fetching dashboard metrics:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return {
    metrics,
    loading,
    error,
    refetch: fetchMetrics,
  };
}
