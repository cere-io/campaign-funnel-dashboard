"use client"

import { useState } from "react"
import { X, User, Trophy, Clock, Play, Brain, Wallet, Twitter, Calendar } from "lucide-react"
import { format, parseISO, differenceInMinutes } from "date-fns"

import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { ScrollArea } from "../components/ui/scroll-area"
import { Avatar, AvatarFallback } from "../components/ui/avatar"

// Mock user activity data for the timeline
const mockUserActivities = [
  {
    username: "mazhutoanton",
    account_id: "6R44Eo6brL3YMMtFuocjgdCN9REzpHHWCGS5AVh49btFN13J",
    activities: {
      "2025-07-10T15:18:24.425Z": {
        quest_type: "quiz",
        points: 30,
        started_at: "2025-07-10T15:18:24.425Z",
        completed_at: "2025-07-10T15:18:38.041Z",
        payload: { answers: Array(5).fill({}) },
      },
      "2025-07-11T16:19:08.175Z": {
        quest_type: "video",
        points: 10,
        started_at: "2025-07-11T16:19:08.175Z",
        completed_at: "2025-07-11T16:19:38.451Z",
        payload: { video_length: 42.27, segments_watched: [0, 1, 2] },
      },
      "2025-07-15T13:04:14.869Z": {
        quest_type: "custom",
        points: 20,
        started_at: "2025-07-15T13:04:14.869Z",
        completed_at: "2025-07-15T13:04:14.869Z",
        payload: { subtype: "wallet", startEvent: "ATTACH_EXTERNAL_ADDRESS", completedEvent: "WALLET_LINKED" },
      },
      "2025-07-20T15:26:15.348Z": {
        quest_type: "custom",
        points: 100,
        started_at: "2025-07-20T15:26:15.348Z",
        completed_at: "2025-07-20T19:34:00.000Z",
        payload: {
          subtype: "dex",
          startEvent: "PINEAPPLE_DEX_ETH_PAPPLE_SWAP_STARTED",
          completedEvent: "PINEAPPLE_DEX_ETH_PAPPLE_SWAP_COMPLETED",
        },
      },
      "2025-07-22T10:04:38.399Z": {
        quest_type: "custom",
        points: 100,
        started_at: "2025-07-22T10:04:38.399Z",
        completed_at: "2025-07-22T10:04:38.399Z",
        payload: { subtype: "x_connect", startEvent: "X_OAUTH_START", completedEvent: "X_OAUTH_FINISHED" },
      },
    },
  },
  {
    username: "cryptotrader99",
    account_id: "5A3xK8oWx4qtqAqUkjX2KaCa8CgSRhkckQX2Tz4E8GMxhGjM",
    activities: {
      "2025-07-12T10:30:15.000Z": {
        quest_type: "quiz",
        points: 30,
        started_at: "2025-07-12T10:30:15.000Z",
        completed_at: "2025-07-12T10:31:22.000Z",
        payload: { answers: Array(5).fill({}) },
      },
      "2025-07-21T14:22:15.000Z": {
        quest_type: "custom",
        points: 100,
        started_at: "2025-07-21T14:22:15.000Z",
        completed_at: "2025-07-21T16:45:22.000Z",
        payload: {
          subtype: "dex",
          startEvent: "PINEAPPLE_DEX_ETH_PAPPLE_SWAP_STARTED",
          completedEvent: "PINEAPPLE_DEX_ETH_PAPPLE_SWAP_COMPLETED",
        },
      },
    },
  },
  {
    username: "defi_explorer",
    account_id: "1A1LLiH7vQ5Vpm7JMaiL125RHNFMEQZvBvkVwANffAzXgSP",
    activities: {
      "2025-07-19T09:15:30.000Z": {
        quest_type: "custom",
        points: 100,
        started_at: "2025-07-19T09:15:30.000Z",
        completed_at: "2025-07-19T12:30:45.000Z",
        payload: {
          subtype: "dex",
          startEvent: "PINEAPPLE_DEX_ETH_PAPPLE_SWAP_STARTED",
          completedEvent: "PINEAPPLE_DEX_ETH_PAPPLE_SWAP_COMPLETED",
        },
      },
    },
  },
]

interface ActivityTimelineModalProps {
  stage: string
  count: number
  onClose: () => void
}

export function ActivityTimelineModal({ stage, count, onClose }: ActivityTimelineModalProps) {
  const [selectedUser, setSelectedUser] = useState<string | null>(null)

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

  const getStageTitle = (stage: string) => {
    switch (stage) {
      case "Started DEX Swap":
        return "Users Who Started DEX Swap"
      case "Connected Wallet":
        return "Users Who Connected Wallet"
      case "Completed Trade":
        return "Users Who Completed Trade"
      default:
        return stage
    }
  }

  // Filter users based on stage (for demo, showing all users for completed trade)
  const relevantUsers = stage === "Completed Trade" ? mockUserActivities : mockUserActivities.slice(0, 2)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg sm:text-xl truncate">{getStageTitle(stage)}</CardTitle>
            <CardDescription className="text-sm">
              {count} users • Click on a user to see their detailed activity timeline
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="flex-shrink-0">
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="flex-1 p-0 min-h-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 h-full">
            {/* Users List */}
            <div className="border-r bg-muted/20">
              <div className="p-4 border-b">
                <h3 className="font-medium text-sm text-muted-foreground">USERS ({relevantUsers.length})</h3>
              </div>
              <ScrollArea className="h-[300px] lg:h-[400px]">
                <div className="p-2">
                  {relevantUsers.map((user) => (
                    <div
                      key={user.username}
                      className={`p-3 rounded-lg cursor-pointer transition-colors mb-2 ${
                        selectedUser === user.username ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                      }`}
                      onClick={() => setSelectedUser(user.username)}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">{user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{user.username}</p>
                          <p className="text-xs opacity-70 font-mono truncate">
                            {user.account_id.slice(0, 8)}...{user.account_id.slice(-6)}
                          </p>
                        </div>
                        <Badge variant="secondary" className="text-xs flex-shrink-0">
                          {Object.keys(user.activities).length} quests
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Activity Timeline */}
            <div className="lg:col-span-2">
              {selectedUser ? (
                <div className="h-full flex flex-col">
                  <div className="p-4 border-b">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>{selectedUser.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{selectedUser}</h3>
                        <p className="text-sm text-muted-foreground">User Activity Timeline</p>
                      </div>
                    </div>
                  </div>

                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {Object.entries(relevantUsers.find((u) => u.username === selectedUser)?.activities || {})
                        .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
                        .map(([timestamp, activity], index, array) => {
                          const Icon = getQuestIcon(activity.quest_type, activity.payload?.subtype)
                          const duration = activity.completed_at
                            ? differenceInMinutes(parseISO(activity.completed_at), parseISO(activity.started_at))
                            : null

                          return (
                            <div key={timestamp} className="relative flex items-start gap-3 sm:gap-4">
                              <div
                                className={`flex h-10 w-10 items-center justify-center rounded-full ${getQuestTypeColor(activity.quest_type)} relative z-10 flex-shrink-0`}
                              >
                                <Icon className="h-5 w-5 text-white" />
                              </div>

                              <div className="flex-1 space-y-2 pb-4 min-w-0">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 min-w-0 flex-1">
                                    <h4 className="font-medium capitalize text-sm truncate">
                                      {activity.quest_type} Quest
                                      {activity.payload?.subtype && (
                                        <span className="text-muted-foreground"> - {activity.payload.subtype}</span>
                                      )}
                                    </h4>
                                    <Badge variant="default" className="text-xs w-fit">
                                      Completed
                                    </Badge>
                                  </div>
                                  <div className="text-right flex-shrink-0">
                                    <div className="font-bold text-green-600 text-sm">+{activity.points} pts</div>
                                    <div className="text-xs text-muted-foreground">
                                      {format(parseISO(activity.started_at), "MMM dd, HH:mm")}
                                    </div>
                                  </div>
                                </div>

                                <div className="text-xs text-muted-foreground">
                                  <div className="flex items-center gap-1 mb-1">
                                    <Calendar className="h-3 w-3" />
                                    Started: {format(parseISO(activity.started_at), "MMM dd, yyyy 'at' HH:mm")}
                                  </div>
                                  {activity.completed_at && (
                                    <div className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      Completed: {format(parseISO(activity.completed_at), "MMM dd, yyyy 'at' HH:mm")}
                                      {duration && <span className="ml-1">({duration} min)</span>}
                                    </div>
                                  )}
                                </div>

                                {/* Quest-specific details */}
                                {activity.quest_type === "quiz" && activity.payload?.answers && (
                                  <div className="text-xs bg-blue-50 dark:bg-blue-950/20 p-2 rounded">
                                    <span className="font-medium">Quiz:</span> {activity.payload.answers.length}{" "}
                                    questions answered
                                  </div>
                                )}

                                {activity.quest_type === "video" && activity.payload && (
                                  <div className="text-xs bg-purple-50 dark:bg-purple-950/20 p-2 rounded">
                                    <span className="font-medium">Video:</span>{" "}
                                    {activity.payload.segments_watched?.length || 0} segments watched
                                    {activity.payload.video_length && (
                                      <span className="ml-1">({Math.round(activity.payload.video_length)}s total)</span>
                                    )}
                                  </div>
                                )}

                                {activity.quest_type === "custom" && activity.payload && (
                                  <div className="text-xs bg-green-50 dark:bg-green-950/20 p-2 rounded">
                                    <div>
                                      <span className="font-medium">Type:</span> {activity.payload.subtype}
                                    </div>
                                    {activity.payload.startEvent && (
                                      <div className="text-xs text-muted-foreground mt-1 break-all">
                                        <span className="block sm:hidden">
                                          {activity.payload.startEvent.length > 20
                                            ? `${activity.payload.startEvent.substring(0, 20)}...`
                                            : activity.payload.startEvent}{" "}
                                          →{" "}
                                          {activity.payload.completedEvent.length > 20
                                            ? `${activity.payload.completedEvent.substring(0, 20)}...`
                                            : activity.payload.completedEvent}
                                        </span>
                                        <span className="hidden sm:block">
                                          {activity.payload.startEvent} → {activity.payload.completedEvent}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* Timeline connector */}
                              {index < array.length - 1 && (
                                <div className="absolute left-5 top-10 h-6 sm:h-8 w-px bg-border" />
                              )}
                            </div>
                          )
                        })}
                    </div>
                  </ScrollArea>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground p-4">
                  <div className="text-center">
                    <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm sm:text-base">Select a user to view their activity timeline</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
