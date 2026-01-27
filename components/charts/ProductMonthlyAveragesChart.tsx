"use client";

import { useMemo } from "react";
import { Group } from "@visx/group";
import { Bar } from "@visx/shape";
import { scaleBand, scaleLinear, scaleOrdinal } from "@visx/scale";
import { AxisBottom, AxisLeft } from "@visx/axis";
import { useTooltip, useTooltipInPortal, defaultStyles, TooltipWithBounds } from "@visx/tooltip";
import { localPoint } from "@visx/event";
import { LegendOrdinal } from "@visx/legend";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@relume_io/relume-ui";

export interface ProductMonthlyAverage {
  product: string;
  monthlyAverages: { month: string; average: number }[];
}

interface ProductMonthlyAveragesChartProps {
  data: ProductMonthlyAverage[];
  showChart?: boolean;
}

const colors = [
  "#8B5CF6", // purple
  "#10B981", // green
  "#3B82F6", // blue
  "#F59E0B", // amber
  "#EF4444", // red
  "#06B6D4", // cyan
  "#EC4899", // pink
];

export function ProductMonthlyAveragesChart({
  data,
  showChart = false,
}: ProductMonthlyAveragesChartProps) {
  // Format month labels
  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return monthNames[date.getMonth()].toUpperCase();
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Get all unique months from all products
  const allMonths = useMemo(() => {
    const monthSet = new Set<string>();
    data.forEach((product) => {
      product.monthlyAverages.forEach((avg) => monthSet.add(avg.month));
    });
    return Array.from(monthSet).sort();
  }, [data]);

  // Create color scale for products
  const productColorScale = useMemo(
    () =>
      scaleOrdinal<string, string>({
        domain: data.map((d) => d.product),
        range: colors,
      }),
    [data]
  );

  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold mb-4">Historical Monthly Averages by Product</h2>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>PRODUCT</TableHead>
              {allMonths.map((month) => (
                <TableHead key={month} className="text-right">
                  {formatMonth(month)}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((product, idx) => (
              <TableRow key={idx}>
                <TableCell className="font-medium">{product.product}</TableCell>
                {allMonths.map((month) => {
                  const average = product.monthlyAverages.find((avg) => avg.month === month)?.average || 0;
                  return (
                    <TableCell key={month} className="text-right">
                      {formatCurrency(average)}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
