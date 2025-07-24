"use client"

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"

interface QuestTypeChartProps {
  data: Record<string, { count: number; points: number }>
}

const COLORS = {
  quiz: "#3b82f6",
  video: "#8b5cf6",
  custom: "#10b981",
  default: "#6b7280",
}

export function QuestTypeChart({ data }: QuestTypeChartProps) {
  const chartData = Object.entries(data).map(([type, stats]) => ({
    name: type.charAt(0).toUpperCase() + type.slice(1),
    value: stats.count,
    points: stats.points,
    color: COLORS[type as keyof typeof COLORS] || COLORS.default,
  }))

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-background border rounded-lg shadow-lg p-3">
          <p className="font-medium">{data.name} Quests</p>
          <p className="text-sm">Count: {data.value}</p>
          <p className="text-sm">Points: {data.points}</p>
        </div>
      )
    }
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quest Distribution</CardTitle>
        <CardDescription>Breakdown by quest type</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
