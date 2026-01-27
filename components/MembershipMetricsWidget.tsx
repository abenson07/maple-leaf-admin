"use client";

import { useDashboard } from "@/hooks/useDashboard";
import {
  MonthlyRevenueChart,
  ProductMonthlyAveragesChart,
  MonthlyBreakdownChart,
} from "@/components/charts";

export function MembershipMetricsWidget() {
  const { data, loading, error, refetch } = useDashboard();

  if (loading) {
    return (
      <div className="rounded-lg border border-border-primary bg-white p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-text-secondary">Loading dashboard metrics...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-border-primary bg-white p-6">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-error mb-4">Error loading dashboard metrics</div>
          <div className="text-text-secondary text-sm mb-4">{error}</div>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data || !data.metrics) {
    return null;
  }

  const metrics = data.metrics;
  const productAverages = data.productAverages || [];

  // Calculate summary metrics
  const totalRevenue = metrics.reduce((sum, m) => sum + m.membershipRevenue + m.otherRevenue, 0);
  const totalNewMemberships = metrics.reduce((sum, m) => sum + m.newMemberships, 0);
  const totalRenewals = metrics.reduce((sum, m) => sum + m.renewals, 0);
  const totalChurns = metrics.reduce((sum, m) => sum + m.churns, 0);
  const activeMemberships = totalNewMemberships + totalRenewals - totalChurns;
  
  // Get current month (last month in the array)
  const currentMonth = metrics[metrics.length - 1];
  const newMembersThisMonth = currentMonth?.newMemberships || 0;
  const renewalsThisMonth = currentMonth?.renewals || 0;

  // Prepare chart data for ViSX components
  const monthlyRevenueData = metrics.map((m) => ({
    month: m.month,
    membershipRevenue: m.membershipRevenue,
    otherRevenue: m.otherRevenue,
  }));

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-border-primary bg-white p-6">
          <div className="text-sm text-text-secondary">Total Members</div>
          <div className="mt-2 text-3xl font-bold">{totalNewMemberships + totalRenewals}</div>
        </div>
        <div className="rounded-lg border border-border-primary bg-white p-6">
          <div className="text-sm text-text-secondary">Active Memberships</div>
          <div className="mt-2 text-3xl font-bold">{Math.max(0, activeMemberships)}</div>
        </div>
        <div className="rounded-lg border border-border-primary bg-white p-6">
          <div className="text-sm text-text-secondary">Total Revenue</div>
          <div className="mt-2 text-3xl font-bold">{formatCurrency(totalRevenue)}</div>
        </div>
        <div className="rounded-lg border border-border-primary bg-white p-6">
          <div className="text-sm text-text-secondary">This Month</div>
          <div className="mt-2 text-sm">
            <div>New: {newMembersThisMonth}</div>
            <div>Renewals: {renewalsThisMonth}</div>
          </div>
        </div>
      </div>

      {/* Monthly Revenue Chart */}
      <div className="rounded-lg border border-border-primary bg-white p-6">
        <div className="flex justify-center overflow-x-auto">
          <div className="min-w-[600px]">
            <MonthlyRevenueChart data={monthlyRevenueData} width={800} height={400} />
          </div>
        </div>
      </div>

      {/* Historical Monthly Averages by Product */}
      {productAverages.length > 0 && (
        <div className="rounded-lg border border-border-primary bg-white p-6">
          <ProductMonthlyAveragesChart 
            data={productAverages.map(product => ({
              product: product.productName,
              monthlyAverages: [
                { month: '2000-01', average: product.monthlyAverages.January },
                { month: '2000-02', average: product.monthlyAverages.February },
                { month: '2000-03', average: product.monthlyAverages.March },
                { month: '2000-04', average: product.monthlyAverages.April },
                { month: '2000-05', average: product.monthlyAverages.May },
                { month: '2000-06', average: product.monthlyAverages.June },
                { month: '2000-07', average: product.monthlyAverages.July },
                { month: '2000-08', average: product.monthlyAverages.August },
                { month: '2000-09', average: product.monthlyAverages.September },
                { month: '2000-10', average: product.monthlyAverages.October },
                { month: '2000-11', average: product.monthlyAverages.November },
                { month: '2000-12', average: product.monthlyAverages.December },
              ]
            }))} 
          />
        </div>
      )}

      {/* Monthly Breakdown Chart */}
      {metrics.length > 0 && (
        <div className="rounded-lg border border-border-primary bg-white p-6">
          <div className="flex justify-center overflow-x-auto">
            <div className="min-w-[600px]">
              <MonthlyBreakdownChart
                data={metrics}
                width={800}
                height={400}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
