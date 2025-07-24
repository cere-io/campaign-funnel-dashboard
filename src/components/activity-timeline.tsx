"use client"

import { format, parseISO } from "date-fns"
import { Badge } from "../components/ui/badge"
import { Brain, Play, Trophy, Wallet, Twitter, Clock } from "lucide-react"

interface Activity {
  timestamp: string
  quest_type: string
  points: number
  started_at: string
  completed_at: string | null
  payload?: any
  duration?: number | null
}

interface ActivityTimelineProps {
  activities: Activity[]
}

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
  const getQuestIcon = (questType: string, subtype?: string) => {
    if (questType === "quiz") return Brain
    if (questType === "video") return Play
    if (questType === "custom") {
      if (subtype === "wallet") return Wallet
      if (subtype === "dex") return Trophy
      if (subtype === "x_connect") return Twitter
    }
    return Clock
  }

  const getQuestTypeColor = (questType: string) => {
    switch (questType) {
      case "quiz":
        return "bg-blue-500"
      case "video":
        return "bg-purple-500"
      case "custom":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="space-y-4">
      {activities.map((activity, index) => {
        const Icon = getQuestIcon(activity.quest_type, activity.payload?.subtype)
        const isCompleted = !!activity.completed_at

        return (
          <div key={activity.timestamp} className="relative flex items-start gap-4">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full ${getQuestTypeColor(activity.quest_type)}`}
            >
              <Icon className="h-5 w-5 text-white" />
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium capitalize">
                    {activity.quest_type} Quest
                    {activity.payload?.subtype && (
                      <span className="text-muted-foreground"> - {activity.payload.subtype}</span>
                    )}
                  </h4>
                  <Badge variant={isCompleted ? "default" : "secondary"}>
                    {isCompleted ? "Completed" : "In Progress"}
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="font-bold text-green-600">+{activity.points} pts</div>
                  <div className="text-xs text-muted-foreground">
                    {format(parseISO(activity.started_at), "MMM dd, HH:mm")}
                  </div>
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                Started: {format(parseISO(activity.started_at), "MMM dd, yyyy 'at' HH:mm")}
                {activity.completed_at && (
                  <>
                    <br />
                    Completed: {format(parseISO(activity.completed_at), "MMM dd, yyyy 'at' HH:mm")}
                    {activity.duration && <span className="ml-2">({activity.duration} min duration)</span>}
                  </>
                )}
              </div>
            </div>

            {index < activities.length - 1 && <div className="absolute left-5 mt-10 h-6 w-px bg-border" />}
          </div>
        )
      })}
    </div>
  )
}
