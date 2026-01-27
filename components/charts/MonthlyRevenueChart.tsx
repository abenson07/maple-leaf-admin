"use client";

import { useMemo } from "react";
import { Group } from "@visx/group";
import { BarStack } from "@visx/shape";
import { scaleBand, scaleLinear, scaleOrdinal } from "@visx/scale";
import { AxisBottom, AxisLeft } from "@visx/axis";
import { useTooltip, useTooltipInPortal, defaultStyles, TooltipWithBounds } from "@visx/tooltip";
import { localPoint } from "@visx/event";
import { LegendOrdinal } from "@visx/legend";

import { ChartDataPoint } from '@/data/dashboard';

interface MonthlyRevenueChartProps {
  data: ChartDataPoint[];
  width?: number;
  height?: number;
}

const defaultMargin = { top: 20, right: 30, bottom: 80, left: 60 };
const purple = "#7c3aed";
const green = "#10b981";

const keys = ["membershipRevenue", "otherRevenue"];
const colorScale = scaleOrdinal<string, string>({
  domain: keys,
  range: [purple, green],
});

export function MonthlyRevenueChart({
  data,
  width = 800,
  height = 400,
}: MonthlyRevenueChartProps) {
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
  } = useTooltip<{ month: string; membershipRevenue: number; otherRevenue: number; total: number }>();

  const { containerRef, TooltipInPortal } = useTooltipInPortal({
    scroll: true,
  });

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

  const yScale = useMemo(
    () =>
      scaleLinear<number>({
        range: [yMax, 0],
        domain: [0, Math.max(...data.map((d) => d.membershipRevenue + d.otherRevenue), 0)],
        nice: true,
      }),
    [data, yMax]
  );

  return (
    <div className="w-full">
      <svg ref={containerRef} width={chartWidth} height={height}>
        <Group left={margin.left} top={margin.top}>
          <BarStack<ChartDataPoint, string>
            data={data}
            keys={keys}
            x={(d) => d.month}
            xScale={xScale}
            yScale={yScale}
            color={colorScale}
          >
            {(barStacks) =>
              barStacks.map((barStack) =>
                barStack.bars.map((bar) => (
                  <rect
                    key={`bar-stack-${barStack.index}-${bar.index}`}
                    x={bar.x}
                    y={bar.y}
                    height={bar.height}
                    width={bar.width}
                    fill={bar.color}
                    onMouseMove={(event) => {
                      const svgElement = (event.target as SVGElement).ownerSVGElement;
                      if (svgElement) {
                        const coords = localPoint(svgElement, event);
                        if (coords) {
                          const monthData = data[barStack.index];
                          if (monthData) {
                            showTooltip({
                              tooltipData: {
                                month: monthData.month,
                                membershipRevenue: monthData.membershipRevenue,
                                otherRevenue: monthData.otherRevenue,
                                total: monthData.membershipRevenue + monthData.otherRevenue,
                              },
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
              )
            }
          </BarStack>

          <AxisBottom
            top={yMax}
            scale={xScale}
            tickLabelProps={() => ({
              fill: "#374151",
              fontSize: 12,
              textAnchor: "end",
              angle: -45,
            })}
          />

          <AxisLeft
            scale={yScale}
            tickFormat={(value) => `$${value.toLocaleString()}`}
            tickLabelProps={() => ({
              fill: "#374151",
              fontSize: 12,
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
          <div className="rounded-lg border border-primary-200 bg-cream-100 p-3 shadow-lg">
            <p className="text-sm font-medium text-primary-800 mb-2">{tooltipData.month}</p>
            <p className="text-sm text-primary-600">
              Memberships: <span className="font-semibold">${tooltipData.membershipRevenue.toFixed(0)}</span>
            </p>
            <p className="text-sm text-primary-600">
              Others: <span className="font-semibold">${tooltipData.otherRevenue.toFixed(0)}</span>
            </p>
            <p className="text-sm font-semibold text-primary-800 mt-1 pt-1 border-t border-primary-200">
              Total: ${tooltipData.total.toFixed(0)}
            </p>
          </div>
        </TooltipInPortal>
      )}

      <div className="flex justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: purple }}></div>
          <span className="text-sm text-neutral-600">Memberships</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: green }}></div>
          <span className="text-sm text-neutral-600">Others</span>
        </div>
      </div>
    </div>
  );
}
