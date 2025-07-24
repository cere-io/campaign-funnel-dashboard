import React from "react"
import { Home, BarChart3, Activity } from "lucide-react"
import { api } from "../../lib/api"

// Navigation items
const navigationItems = [
  {
    title: "Overview",
    icon: Home,
    id: "overview",
  },
  {
    title: "Campaign Funnel",
    icon: BarChart3,
    id: "funnel",
  },
  {
    title: "User Activity",
    icon: Activity,
    id: "user-activity",
  },
]

interface AppSidebarProps {
  activeView: string
  onViewChange: (view: string) => void
  className?: string
}

export function AppSidebar({ activeView, onViewChange, className = "" }: AppSidebarProps) {
  return (
    <div className={`w-64 bg-background border-r border-border h-full flex flex-col ${className}`}>
      {/* Sidebar Header */}
      <div className="border-b border-border px-6 py-4">
        <div>
          <h2 className="text-lg font-semibold">Community Intelligence</h2>
          <p className="text-sm text-muted-foreground">Campaign Analytics Dashboard</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-3 py-4">
        <div className="space-y-1">
          <div className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Navigation
          </div>
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors ${
                activeView === item.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.title}</span>
            </button>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="mt-8">
          <div className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Quick Stats
          </div>
          <div className="px-3 py-2 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Active Users</span>
              <span className="font-medium">5</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Messages</span>
              <span className="font-medium">5</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Completed Trades</span>
              <span className="font-medium">5</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Sentiment</span>
              <span className="font-medium text-green-600">80%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 