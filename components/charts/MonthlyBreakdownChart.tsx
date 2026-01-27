"use client";

import { useMemo } from "react";
import { Group } from "@visx/group";
import { LinePath, AreaClosed } from "@visx/shape";
import { curveMonotoneX } from "@visx/curve";
import { scaleBand, scaleLinear, scaleOrdinal } from "@visx/scale";
import { AxisBottom, AxisLeft } from "@visx/axis";
import { useTooltip, useTooltipInPortal, defaultStyles } from "@visx/tooltip";
import { localPoint } from "@visx/event";
import { LegendOrdinal } from "@visx/legend";

export interface MonthlyBreakdownData {
  month: string;
  newMemberships: number;
  renewals: number;
  churns: number;
}

interface MonthlyBreakdownChartProps {
  data: MonthlyBreakdownData[];
  width?: number;
  height?: number;
}

const defaultMargin = { top: 20, right: 20, bottom: 60, left: 60 };
const colors = {
  newMemberships: "#3B82F6", // blue
  renewals: "#10B981", // green
  churns: "#EF4444", // red
};

const keys: string[] = ["newMemberships", "renewals", "churns"];
const colorScale = scaleOrdinal<string, string>({
  domain: keys,
  range: [colors.newMemberships, colors.renewals, colors.churns],
});

export function MonthlyBreakdownChart({
  data,
  width = 800,
  height = 400,
}: MonthlyBreakdownChartProps) {
  const margin = defaultMargin;
  // Ensure minimum width for readability
  const chartWidth = Math.max(width, 600);
  const xMax = chartWidth - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;

  const {
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
    showTooltip,
    hideTooltip,
  } = useTooltip<MonthlyBreakdownData>();

  const { containerRef, TooltipInPortal } = useTooltipInPortal({
    scroll: true,
  });

  // Format month labels
  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
  };

  // Scales
  const xScale = useMemo(
    () =>
      scaleBand<string>({
        range: [0, xMax],
        domain: data.map((d) => d.month),
        padding: 0.2,
      }),
    [data, xMax]
  );

  const maxValue = useMemo(
    () =>
      Math.max(
        ...data.map((d) => Math.max(d.newMemberships, d.renewals, d.churns))
      ),
    [data]
  );

  const yScale = useMemo(
    () =>
      scaleLinear<number>({
        range: [yMax, 0],
        domain: [0, maxValue],
        nice: true,
      }),
    [maxValue, yMax]
  );

  const getMonthLabel = (month: string) => formatMonth(month);

  // Create line data points
  const lineData = useMemo(() => {
    return keys.map((key) => ({
      key,
      points: data.map((d) => ({
        x: (xScale(d.month) || 0) + xScale.bandwidth() / 2,
        y: yScale(d[key as keyof MonthlyBreakdownData] as number),
        month: d.month,
        value: d[key as keyof MonthlyBreakdownData] as number,
      })),
    }));
  }, [data, xScale, yScale]);

  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold mb-4">Monthly Breakdown</h2>
      
      <div className="mb-4 flex justify-center">
        <LegendOrdinal
          scale={colorScale}
          labelFormat={(label) => {
            if (label === "newMemberships") return "New Memberships";
            if (label === "renewals") return "Renewals";
            if (label === "churns") return "Churns";
            return label;
          }}
        />
      </div>

      <svg ref={containerRef} width={chartWidth} height={height}>
        <Group left={margin.left} top={margin.top}>
          {/* Render lines */}
          {lineData.map((line) => (
            <LinePath
              key={line.key}
              data={line.points}
              x={(d) => d.x}
              y={(d) => d.y}
              stroke={colorScale(line.key)}
              strokeWidth={2}
              curve={curveMonotoneX}
            />
          ))}

          {/* Render data points */}
          {lineData.map((line) =>
            line.points.map((point, idx) => (
              <circle
                key={`${line.key}-${idx}`}
                cx={point.x}
                cy={point.y}
                r={4}
                fill={colorScale(line.key)}
                onMouseMove={(event) => {
                  const svgElement = (event.target as SVGElement).ownerSVGElement;
                  if (svgElement) {
                    const coords = localPoint(svgElement, event);
                    if (coords) {
                      const monthData = data.find((d) => d.month === point.month);
                      if (monthData) {
                        showTooltip({
                          tooltipData: monthData,
                          tooltipLeft: coords.x,
                          tooltipTop: coords.y,
                        });
                      }
                    }
                  }
                }}
                onMouseLeave={() => hideTooltip()}
              />
            ))
          )}

          <AxisBottom
            top={yMax}
            scale={xScale}
            tickFormat={getMonthLabel}
            tickLabelProps={() => ({
              fill: "#666",
              fontSize: 11,
              textAnchor: "middle",
            })}
          />

          <AxisLeft
            scale={yScale}
            tickLabelProps={() => ({
              fill: "#666",
              fontSize: 11,
              textAnchor: "end",
              dx: -5,
            })}
          />
        </Group>
      </svg>

      {tooltipOpen && tooltipData && (
        <TooltipInPortal
          top={tooltipTop}
          left={tooltipLeft}
          style={defaultStyles}
        >
          <div className="bg-gray-800 text-white p-2 rounded shadow-lg">
            <div className="font-semibold">{formatMonth(tooltipData.month)}</div>
            <div>New Memberships: {tooltipData.newMemberships}</div>
            <div>Renewals: {tooltipData.renewals}</div>
            <div>Churns: {tooltipData.churns}</div>
          </div>
        </TooltipInPortal>
      )}
    </div>
  );
}
