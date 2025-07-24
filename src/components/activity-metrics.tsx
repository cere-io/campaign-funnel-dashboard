"use client"

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { format, parseISO } from "date-fns"

interface ActivityMetricsProps {
  activities: Array<{
    timestamp: string
    quest_type: string
    points: number
    started_at: string
    completed_at: string | null
  }>
}

export function ActivityMetrics({ activities }: ActivityMetricsProps) {
  // Group activities by date and calculate daily points
  const dailyData = activities.reduce(
    (acc, activity) => {
      const date = format(parseISO(activity.started_at), "yyyy-MM-dd")
      if (!acc[date]) {
        acc[date] = { date, points: 0, quests: 0 }
      }
      acc[date].points += activity.points
      acc[date].quests += 1
      return acc
    },
    {} as Record<string, { date: string; points: number; quests: number }>,
  )

  const chartData = Object.values(dailyData).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg shadow-lg p-3">
          <p className="font-medium">{format(new Date(label), "MMM dd, yyyy")}</p>
          <p className="text-sm">Points: {payload[0].value}</p>
          <p className="text-sm">Quests: {payload[0].payload.quests}</p>
        </div>
      )
    }
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Activity</CardTitle>
        <CardDescription>Points earned per day</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => format(new Date(value), "MMM dd")}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="points" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
