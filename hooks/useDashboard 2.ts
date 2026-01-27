import { useState, useEffect, useCallback } from 'react';
import { DashboardData, ChartDataPoint, TableRow } from '@/data/dashboard';

export const useDashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // API routes require basePath prefix with OpenNext Cloudflare adapter
      const basePath = '/dashboard';
      const apiUrl = typeof window !== 'undefined' && window.location.origin
        ? `${window.location.origin}${basePath}/api/dashboard/membership-metrics`
        : `${basePath}/api/dashboard/membership-metrics`;
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch dashboard data: ${response.statusText}`);
      }

      const dashboardData: DashboardData = await response.json();
      setData(dashboardData);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Transform data for stacked bar chart (membershipRevenue and otherRevenue)
  const chartData: ChartDataPoint[] = data?.metrics.map(m => ({
    month: m.monthLabel,
    membershipRevenue: m.membershipRevenue,
    otherRevenue: m.otherRevenue,
  })) || [];

  // Transform membership metrics for table (3 rows: new memberships, renewals, churns)
  const membershipTableRows: TableRow[] = [
    {
      label: 'New Memberships',
      values: data?.metrics.map(m => m.newMemberships) || [],
    },
    {
      label: 'Renewals',
      values: data?.metrics.map(m => m.renewals) || [],
    },
    {
      label: 'Churns',
      values: data?.metrics.map(m => m.churns) || [],
    },
  ];

  // Transform product averages for table (one row per product with monthly averages)
  const monthOrder = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const productTableRows: TableRow[] = (data?.productAverages || []).map(product => ({
    label: product.productName,
    values: monthOrder.map(month => product.monthlyAverages[month as keyof typeof product.monthlyAverages] || 0),
  }));

  // Get month labels for membership table (last 12 months)
  const membershipMonthLabels = data?.metrics.map(m => m.monthLabel) || [];
  
  // Get month labels for product table (just month names, not year)
  const productMonthLabels = monthOrder.map(month => month.substring(0, 3)); // Jan, Feb, etc.

  return {
    data,
    chartData,
    membershipTableRows,
    membershipMonthLabels,
    productTableRows,
    productMonthLabels,
    loading,
    error,
    refetch: fetchDashboardData,
  };
};

