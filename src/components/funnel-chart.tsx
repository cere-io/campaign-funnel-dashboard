import React from "react"

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from "recharts"

interface FunnelChartProps {
  data: {
    startedDexSwap: number
    connectedCereWallet: number
    completedTrade: number
  }
  onStageClick?: (stage: string, count: number) => void
}

export function FunnelChart({ data, onStageClick }: FunnelChartProps) {
  const funnelData = [
    {
      stage: "Started DEX Swap",
      count: data.startedDexSwap,
      percentage: 100,
      color: "#3b82f6",
    },
    {
      stage: "Connected Wallet",
      count: data.connectedCereWallet,
      percentage: (data.connectedCereWallet / data.startedDexSwap) * 100,
      color: "#8b5cf6",
    },
    {
      stage: "Completed Trade",
      count: data.completedTrade,
      percentage: (data.completedTrade / data.startedDexSwap) * 100,
      color: "#10b981",
    },
  ]

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const dropOff =
        funnelData.findIndex((item) => item.stage === data.stage) > 0
          ? funnelData[funnelData.findIndex((item) => item.stage === data.stage) - 1].count - data.count
          : 0

      return (
        <div className="bg-background border rounded-lg shadow-lg p-3">
          <p className="font-medium">{label}</p>
          <p className="text-sm">
            <span className="font-medium">{data.count}</span> users ({data.percentage.toFixed(1)}%)
          </p>
          {dropOff > 0 && (
            <p className="text-sm text-red-600">
              -{dropOff} users dropped off (
              {(
                (dropOff / funnelData[funnelData.findIndex((item) => item.stage === data.stage) - 1].count) *
                100
              ).toFixed(1)}
              %)
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-1">Click to view user activities</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="h-[250px] sm:h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={funnelData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis
            dataKey="stage"
            tick={{ fontSize: 10 }}
            interval={0}
            angle={-45}
            textAnchor="end"
            height={80}
            className="text-xs"
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="count"
            radius={[4, 4, 0, 0]}
            onClick={(data: any) => onStageClick?.(data.stage, data.count)}
            style={{ cursor: "pointer" }}
          >
            {funnelData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
