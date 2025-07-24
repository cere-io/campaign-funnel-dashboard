import React from "react"
import { TrendingUp, TrendingDown } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"

interface KPICardProps {
  title: string
  value: string | number
  icon: React.ComponentType<{ className?: string }>
  trend: number
  description: string
  isPercentage?: boolean
  clickable?: boolean
  onClick?: () => void
}

export function KPICard({
  title,
  value,
  icon: Icon,
  trend,
  description,
  isPercentage = false,
  clickable = false,
  onClick,
}: KPICardProps) {
  const isPositive = trend >= 0
  const TrendIcon = isPositive ? TrendingUp : TrendingDown

  return (
    <Card
      className={`relative overflow-hidden ${
        clickable ? "cursor-pointer hover:shadow-md transition-shadow" : ""
      }`}
      onClick={clickable ? onClick : undefined}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center mt-2">
          <TrendIcon className={`h-3 w-3 mr-1 ${isPositive ? "text-green-500" : "text-red-500"}`} />
          <span className={`text-xs font-medium ${isPositive ? "text-green-600" : "text-red-600"}`}>
            {isPositive ? "+" : ""}
            {trend}%
          </span>
          <span className="text-xs text-muted-foreground ml-2">{description}</span>
        </div>
      </CardContent>
    </Card>
  )
}
