"use client";

import { useDashboard } from "@/hooks/useDashboard";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@relume_io/relume-ui";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export function MembershipMetricsWidget() {
  const { metrics, loading, error, refetch } = useDashboard();

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

  if (!metrics) {
    return null;
  }

  // Prepare chart data
  const chartData = {
    labels: metrics.monthlyBreakdown.map((m) => {
      const [year, month] = m.month.split("-");
      const date = new Date(parseInt(year), parseInt(month) - 1);
      // Use deterministic formatting to avoid hydration mismatches
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
    }),
    datasets: [
      {
        label: "Memberships",
        data: metrics.monthlyBreakdown.map((m) => m.membershipRevenue),
        backgroundColor: "#6b8e23",
      },
      {
        label: "Others",
        data: metrics.monthlyBreakdown.map((m) => m.otherRevenue),
        backgroundColor: "#8fb347",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            return `${context.dataset.label}: $${context.parsed.y.toFixed(2)}`;
          },
        },
      },
    },
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
        ticks: {
          callback: function (value: any) {
            return `$${value}`;
          },
        },
      },
    },
  };

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
          <div className="mt-2 text-3xl font-bold">{metrics.totalMembers}</div>
        </div>
        <div className="rounded-lg border border-border-primary bg-white p-6">
          <div className="text-sm text-text-secondary">Active Memberships</div>
          <div className="mt-2 text-3xl font-bold">{metrics.activeMemberships}</div>
        </div>
        <div className="rounded-lg border border-border-primary bg-white p-6">
          <div className="text-sm text-text-secondary">Total Revenue</div>
          <div className="mt-2 text-3xl font-bold">{formatCurrency(metrics.totalRevenue)}</div>
        </div>
        <div className="rounded-lg border border-border-primary bg-white p-6">
          <div className="text-sm text-text-secondary">This Month</div>
          <div className="mt-2 text-sm">
            <div>New: {metrics.newMembersThisMonth}</div>
            <div>Renewals: {metrics.renewalsThisMonth}</div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="rounded-lg border border-border-primary bg-white p-6">
        <h2 className="text-xl font-semibold mb-4">Monthly Revenue Breakdown</h2>
        <div className="h-96">
          <Bar data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* Monthly Breakdown Table */}
      <div className="rounded-lg border border-border-primary bg-white p-6">
        <h2 className="text-xl font-semibold mb-4">Monthly Breakdown</h2>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Month</TableHead>
                <TableHead className="text-right">Total Revenue</TableHead>
                <TableHead className="text-right">Membership Revenue</TableHead>
                <TableHead className="text-right">Other Revenue</TableHead>
                <TableHead className="text-right">New Members</TableHead>
                <TableHead className="text-right">Renewals</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {metrics.monthlyBreakdown.map((month, index) => {
                const [year, monthNum] = month.month.split("-");
                const date = new Date(parseInt(year), parseInt(monthNum) - 1);
                // Use deterministic formatting to avoid hydration mismatches
                const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                const monthLabel = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;

                return (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{monthLabel}</TableCell>
                    <TableCell className="text-right">{formatCurrency(month.totalRevenue)}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(month.membershipRevenue)}
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(month.otherRevenue)}</TableCell>
                    <TableCell className="text-right">{month.newMembers}</TableCell>
                    <TableCell className="text-right">{month.renewals}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
