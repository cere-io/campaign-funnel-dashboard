import { ArrowLeft, User, Trophy, Clock, Play, Brain, Wallet, Twitter } from "lucide-react"
import { format, parseISO, differenceInMinutes } from "date-fns"

import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { Progress } from "./ui/progress"
import { QuestTypeChart } from "./quest-type-chart"
import { ActivityMetrics } from "./activity-metrics"

// Mock user activity data
const mockUserActivity = {
  "2025-07-10T15:18:24.425Z": {
    account_id: "6R44Eo6brL3YMMtFuocjgdCN9REzpHHWCGS5AVh49btFN13J",
    organization_id: "2115",
    campaign_id: "58",
    quest_type: "quiz",
    points: 30,
    started_at: "2025-07-10T15:18:24.425Z",
    payload: {
      answers: [
        { quiz_id: "quiz-1752158562660", question_id: "question-1752158562660", answer_id: "option-1-1752158562660" },
        { quiz_id: "quiz-1752158562660", question_id: "question-1752158603357", answer_id: "option-1752158603357-0" },
        { quiz_id: "quiz-1752158562660", question_id: "question-1752158635006", answer_id: "option-1752158645455-2" },
        { quiz_id: "quiz-1752158562660", question_id: "question-1752158680070", answer_id: "option-1752158690771-3" },
        { quiz_id: "quiz-1752158562660", question_id: "question-1752158722037", answer_id: "option-1752158723688-2" },
      ],
    },
    completed_at: "2025-07-10T15:18:38.041Z",
  },
  "2025-07-11T16:19:08.175Z": {
    account_id: "6R44Eo6brL3YMMtFuocjgdCN9REzpHHWCGS5AVh49btFN13J",
    organization_id: "2115",
    campaign_id: "58",
    quest_type: "video",
    points: 10,
    started_at: "2025-07-11T16:19:08.175Z",
    payload: {
      video_id:
        "https://cdn.ddc-dragon.com/1167/baear4igueahvggcx4cht752idm4eb3mnklgofsvufa7zbhbe6mcre7ulpu/pineappleV3.2.mp4",
      video_length: 42.266666666666666,
      segment_length: "15",
      segments_watched: [0, 1, 2],
      last_watched_segment: 0,
    },
    completed_at: "2025-07-11T16:19:38.451Z",
  },
  "2025-07-15T13:04:14.869Z": {
    account_id: "6R44Eo6brL3YMMtFuocjgdCN9REzpHHWCGS5AVh49btFN13J",
    organization_id: 2115,
    campaign_id: "58",
    quest_type: "custom",
    points: 20,
    started_at: "2025-07-15T13:04:14.869Z",
    payload: {
      questId: "custom-1752234479349",
      subtype: "wallet",
      startEvent: "ATTACH_EXTERNAL_ADDRESS",
      completedEvent: "WALLET_LINKED",
    },
    completed_at: "2025-07-15T13:04:14.869Z",
  },
  "2025-07-20T15:26:15.348Z": {
    account_id: "6R44Eo6brL3YMMtFuocjgdCN9REzpHHWCGS5AVh49btFN13J",
    organization_id: 2115,
    campaign_id: 58,
    quest_type: "custom",
    points: 100,
    started_at: "2025-07-20T15:26:15.348Z",
    payload: {
      questId: "custom-1752234768139",
      subtype: "dex",
      startEvent: "PINEAPPLE_DEX_ETH_PAPPLE_SWAP_STARTED",
      completedEvent: "PINEAPPLE_DEX_ETH_PAPPLE_SWAP_COMPLETED",
    },
    completed_at: "2025-07-20T19:34:00.000Z",
  },
  "2025-07-22T10:04:38.399Z": {
    account_id: "6R44Eo6brL3YMMtFuocjgdCN9REzpHHWCGS5AVh49btFN13J",
    organization_id: 2115,
    campaign_id: 58,
    quest_type: "custom",
    points: 100,
    started_at: "2025-07-22T10:04:38.399Z",
    payload: {
      questId: "x-connect-1752234530288",
      subtype: "x_connect",
      startEvent: "X_OAUTH_START",
      completedEvent: "X_OAUTH_FINISHED",
    },
    completed_at: "2025-07-22T10:04:38.399Z",
  },
}

interface UserActivityDetailProps {
  user: any
  onBack: () => void
}

export function UserActivityDetail({ user, onBack }: UserActivityDetailProps) {
  // Process activity data
  const activities = Object.entries(mockUserActivity)
    .map(([timestamp, activity]) => ({
      ...activity,
      timestamp,
      duration: activity.completed_at
        ? differenceInMinutes(parseISO(activity.completed_at), parseISO(activity.started_at))
        : null,
    }))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  // Calculate metrics
  const totalPoints = activities.reduce((sum, activity) => sum + activity.points, 0)
  const completedQuests = activities.filter((activity) => activity.completed_at).length
  const totalQuests = activities.length
  const completionRate = (completedQuests / totalQuests) * 100

  const questTypeStats = activities.reduce(
    (acc, activity) => {
      const type = activity.quest_type
      if (!acc[type]) {
        acc[type] = { count: 0, points: 0 }
      }
      acc[type].count++
      acc[type].points += activity.points
      return acc
    },
    {} as Record<string, { count: number; points: number }>,
  )

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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
          <Button variant="outline" onClick={onBack} size="sm" className="w-fit bg-transparent">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Users
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <span className="text-lg font-semibold">
                  {user.username.slice(0, 2).toUpperCase()}
                </span>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{user.username}</h1>
                <p className="text-muted-foreground text-sm font-mono">
                  {user.account_id.slice(0, 12)}...{user.account_id.slice(-8)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* User Metrics */}
        <div className="grid gap-4 sm:grid-cols-3 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Amount Traded</CardTitle>
              <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center">
                <span className="text-white text-sm font-bold">$</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">$2,450</div>
              <p className="text-xs text-muted-foreground">Following DEX swaps</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Preferred Quests</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Video</div>
              <div className="flex flex-wrap gap-1 mt-2">
                <Badge variant="secondary" className="text-xs">video (4)</Badge>
                <Badge variant="secondary" className="text-xs">custom (3)</Badge>
                <Badge variant="secondary" className="text-xs">quiz (1)</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completionRate.toFixed(1)}%</div>
              <Progress value={completionRate} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">{completedQuests}/{totalQuests} completed</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid gap-6 lg:grid-cols-2 mb-6">
          <QuestTypeChart data={questTypeStats} />
          <ActivityMetrics activities={activities} />
        </div>

        {/* Activity Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Activity Timeline</CardTitle>
            <CardDescription>Detailed quest completion journey with interactive elements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activities.map((activity, index) => {
                const Icon = getQuestIcon(activity.quest_type, (activity.payload as any)?.subtype)
                const isCompleted = !!activity.completed_at

                return (
                  <div key={activity.timestamp} className="flex items-start gap-3 sm:gap-4">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full ${getQuestTypeColor(activity.quest_type)} flex-shrink-0`}
                    >
                      <Icon className="h-5 w-5 text-white" />
                    </div>

                    <div className="flex-1 space-y-2 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 min-w-0 flex-1">
                          <h4 className="font-medium capitalize text-sm sm:text-base truncate">
                            {activity.quest_type} Quest
                            {'subtype' in activity.payload && (
                              <span className="text-muted-foreground"> - {(activity.payload as any).subtype}</span>
                            )}
                          </h4>
                          <Badge variant={isCompleted ? "default" : "secondary"} className="w-fit">
                            {isCompleted ? "Completed" : "In Progress"}
                          </Badge>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="font-bold text-green-600 text-sm sm:text-base">+{activity.points} pts</div>
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

                      {/* Quest-specific details */}
                      {activity.quest_type === "quiz" && 'answers' in activity.payload && (
                        <div className="text-sm">
                          <span className="font-medium">Quiz completed:</span> {(activity.payload as any).answers.length}{" "}
                          questions answered
                        </div>
                      )}

                      {activity.quest_type === "video" && 'segments_watched' in activity.payload && (
                        <div className="text-sm">
                          <span className="font-medium">Video progress:</span>{" "}
                          {(activity.payload as any).segments_watched?.length || 0} segments watched
                          {(activity.payload as any).video_length && (
                            <span className="ml-2">({Math.round((activity.payload as any).video_length)}s total)</span>
                          )}
                        </div>
                      )}

                      {activity.quest_type === "custom" && 'subtype' in activity.payload && (
                        <div className="text-sm">
                          <span className="font-medium">Custom quest:</span> {(activity.payload as any).subtype}
                          {(activity.payload as any).startEvent && (
                            <div className="text-xs text-muted-foreground mt-1 break-all">
                              <span className="block sm:hidden">
                                {(activity.payload as any).startEvent.length > 25
                                  ? `${(activity.payload as any).startEvent.substring(0, 25)}...`
                                  : (activity.payload as any).startEvent}{" "}
                                →{" "}
                                {(activity.payload as any).completedEvent.length > 25
                                  ? `${(activity.payload as any).completedEvent.substring(0, 25)}...`
                                  : (activity.payload as any).completedEvent}
                              </span>
                              <span className="hidden sm:block">
                                {(activity.payload as any).startEvent} → {(activity.payload as any).completedEvent}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {index < activities.length - 1 && <div className="absolute left-5 mt-10 h-6 w-px bg-border" />}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 