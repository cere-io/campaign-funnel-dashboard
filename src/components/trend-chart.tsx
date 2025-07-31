"use client"

import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts"

interface TrendChartProps {
  data?: {
    startedDexSwap?: Array<{ date: string; value: number }>
    completedTrade?: Array<{ date: string; value: number }>
    connectedCereWallet?: Array<{ date: string; value: number }>
  }
}

export function TrendChart({ data }: TrendChartProps) {
  // Transform the API data into chart format
  const transformTrendData = () => {
    if (!data || !data.startedDexSwap) {
      // Fallback mock data if no real data available
      return [
        { date: "Jul 18", started: 2, connected: 0, completed: 2 },
        { date: "Jul 19", started: 12, connected: 0, completed: 12 },
        { date: "Jul 20", started: 20, connected: 0, completed: 20 },
        { date: "Jul 21", started: 9, connected: 0, completed: 8 },
        { date: "Jul 22", started: 20, connected: 2, completed: 16 },
        { date: "Jul 23", started: 1, connected: 0, completed: 0 },
        { date: "Jul 24", started: 2, connected: 0, completed: 0 },
      ]
    }

    // Create a map of all dates from all datasets
    const dateMap = new Map<string, { started: number; connected: number; completed: number }>()

    // Add started data
    data.startedDexSwap.forEach((item) => {
      const shortDate = new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
      dateMap.set(shortDate, { started: item.value, connected: 0, completed: 0 })
    })

    // Add connected wallet data
    data.connectedCereWallet?.forEach((item) => {
      const shortDate = new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
      const existing = dateMap.get(shortDate) || { started: 0, connected: 0, completed: 0 }
      dateMap.set(shortDate, { ...existing, connected: item.value })
    })

    // Add completed data
    data.completedTrade?.forEach((item) => {
      const shortDate = new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
      const existing = dateMap.get(shortDate) || { started: 0, connected: 0, completed: 0 }
      dateMap.set(shortDate, { ...existing, completed: item.value })
    })

    // Convert to array and sort by date
    return Array.from(dateMap.entries())
      .map(([date, values]) => ({ date, ...values }))
      .sort((a, b) => new Date(a.date + " 2025").getTime() - new Date(b.date + " 2025").getTime())
  }

  const trendData = transformTrendData()

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const startedValue = payload.find((p: any) => p.dataKey === "started")?.value || 0
      // const connectedValue = payload.find((p: any) => p.dataKey === "connected")?.value || 0
      const completedValue = payload.find((p: any) => p.dataKey === "completed")?.value || 0
      const conversionRate = startedValue > 0 ? ((completedValue / startedValue) * 100).toFixed(1) : "0"

      return (
        <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm p-4 border rounded-lg shadow-lg max-w-xs">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="font-medium text-sm text-slate-900 dark:text-slate-100">{label}</span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-xs text-slate-600 dark:text-slate-400">Started DEX</span>
              </div>
              <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{startedValue}</span>
            </div>

            {/*<div className="flex items-center justify-between gap-4">*/}
            {/*  <div className="flex items-center gap-2">*/}
            {/*    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>*/}
            {/*    <span className="text-xs text-slate-600 dark:text-slate-400">Connected Wallet</span>*/}
            {/*  </div>*/}
            {/*  <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{connectedValue}</span>*/}
            {/*</div>*/}

            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-slate-600 dark:text-slate-400">Completed Trade</span>
              </div>
              <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{completedValue}</span>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-600 pt-2">
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs text-slate-600 dark:text-slate-400">Conversion Rate</span>
                <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">{conversionRate}%</span>
              </div>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="startedGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="connectedGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#f97316" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="completedGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="opacity-20" stroke="#e2e8f0" />
          <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="started"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="url(#startedGradient)"
            name="Started DEX Swap"
          />
          {/* @TODO uncomment */}
          {/*<Area*/}
          {/*  type="monotone"*/}
          {/*  dataKey="connected"*/}
          {/*  stroke="#f97316"*/}
          {/*  strokeWidth={2}*/}
          {/*  fill="url(#connectedGradient)"*/}
          {/*  name="Connected Wallet"*/}
          {/*/>*/}
          <Area
            type="monotone"
            dataKey="completed"
            stroke="#10b981"
            strokeWidth={2}
            fill="url(#completedGradient)"
            name="Completed Trade"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
