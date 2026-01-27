"use client";

import { MonthlyRevenueChart } from '@/components/charts';
import { ChartDataPoint, TableRow } from '@/data/dashboard';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow as RelumeTableRow,
} from '@relume_io/relume-ui';

type MembershipMetricsWidgetProps = {
  chartData: ChartDataPoint[];
  membershipTableRows: TableRow[];
  membershipMonthLabels: string[];
  productTableRows: TableRow[];
  productMonthLabels: string[];
  loading?: boolean;
};

const MembershipMetricsWidget = ({ 
  chartData, 
  membershipTableRows,
  membershipMonthLabels,
  productTableRows,
  productMonthLabels,
  loading = false 
}: MembershipMetricsWidgetProps) => {
  // Format currency for product table
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (loading) {
    return (
      <div className="rounded-lg border border-primary-300 bg-cream-100 p-6 shadow-sm">
        <div className="flex items-center justify-center py-12">
          <p className="text-neutral-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-primary-300 bg-cream-100 p-6 shadow-sm">
      <h2 className="mb-6 text-xl font-semibold text-primary-800">Membership Metrics</h2>
      
      {/* Stacked Bar Chart */}
      <div className="mb-8">
        <h3 className="mb-4 text-sm font-medium text-primary-700">Monthly Revenue</h3>
        <div className="flex justify-center overflow-x-auto">
          <div className="min-w-[600px]">
            <MonthlyRevenueChart data={chartData} width={800} height={300} />
          </div>
        </div>
      </div>

      {/* Membership Metrics Table */}
      <div className="mb-8">
        <h3 className="mb-4 text-sm font-medium text-primary-700">Monthly Breakdown</h3>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <RelumeTableRow>
                <TableHead className="text-left">Metric</TableHead>
                {membershipMonthLabels.map((label, index) => (
                  <TableHead key={index} className="text-center">
                    {label}
                  </TableHead>
                ))}
              </RelumeTableRow>
            </TableHeader>
            <TableBody>
              {membershipTableRows.map((row, rowIndex) => (
                <RelumeTableRow key={rowIndex}>
                  <TableCell className="font-medium">{row.label}</TableCell>
                  {row.values.map((value, colIndex) => (
                    <TableCell key={colIndex} className="text-center">
                      {value}
                    </TableCell>
                  ))}
                </RelumeTableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Product Averages Table */}
      <div>
        <h3 className="mb-4 text-sm font-medium text-primary-700">Historical Monthly Averages by Product</h3>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <RelumeTableRow>
                <TableHead className="text-left">Product</TableHead>
                {productMonthLabels.map((label, index) => (
                  <TableHead key={index} className="text-center">
                    {label}
                  </TableHead>
                ))}
              </RelumeTableRow>
            </TableHeader>
            <TableBody>
              {productTableRows.map((row, rowIndex) => (
                <RelumeTableRow key={rowIndex}>
                  <TableCell className="font-medium">{row.label}</TableCell>
                  {row.values.map((value, colIndex) => (
                    <TableCell key={colIndex} className="text-center">
                      {formatCurrency(value)}
                    </TableCell>
                  ))}
                </RelumeTableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default MembershipMetricsWidget;

