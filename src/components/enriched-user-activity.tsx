import React, { useState } from "react"
import {
  ArrowLeft,
  Trophy,
  Clock,
  Play,
  Brain,
  Wallet,
  Twitter,
  Calendar,
  CheckCircle,
  XCircle,
  BarChart3,
  Video,
  MessageSquare,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Award,
  Target,
  ArrowRightLeft,
} from "lucide-react"
import { format, parseISO, differenceInMinutes } from "date-fns"

import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { Progress } from "./ui/progress"
import { Avatar, AvatarFallback } from "./ui/avatar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible"

// Enhanced mock user activity data matching your API structure
const mockEnrichedUserActivity = {
  username: "mazhutoanton",
  account_id: "6R44Eo6brL3YMMtFuocjgdCN9REzpHHWCGS5AVh49btFN13J",
  organization_id: "2115",
  campaign_id: "58",
  activities: {
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
    "2025-07-15T16:50:19.779Z": {
      account_id: "6R44Eo6brL3YMMtFuocjgdCN9REzpHHWCGS5AVh49btFN13J",
      organization_id: "2115",
      campaign_id: "58",
      quest_type: "video",
      points: 20,
      started_at: "2025-07-15T16:50:19.779Z",
      payload: {
        video_id:
          "https://cdn.ddc-dragon.com/1167/baear4ig4ekjl3pssjk6hkme7bqu5txcw7l7ru3mdzkflvl7vskmuwupbyu/pineappleV3.3.mp4",
        video_length: 177.35254875283448,
        segment_length: "15",
        segments_watched: [0, 1, 2, 3, 4, 6, 7, 8, 9, 10, 5, 11],
        last_watched_segment: 10,
      },
      completed_at: "2025-07-15T18:21:15.849Z",
    },
    "2025-07-18T15:04:25.185Z": {
      account_id: "6R44Eo6brL3YMMtFuocjgdCN9REzpHHWCGS5AVh49btFN13J",
      organization_id: "2115",
      campaign_id: "58",
      quest_type: "video",
      points: 20,
      started_at: "2025-07-18T15:04:25.185Z",
      payload: {
        video_id:
          "https://cdn.ddc-dragon.com/1167/baear4ifheh76vfw2f66ojnrzze2l6lij73zie7bbhusmjwkdvm25kag37i/100m ecosytem - final.mp4",
        video_length: 180.633333,
        segment_length: "15",
        segments_watched: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        last_watched_segment: 7,
      },
      completed_at: "2025-07-18T15:06:30.046Z",
    },
    "2025-07-20T15:02:28.597Z": {
      account_id: "6R44Eo6brL3YMMtFuocjgdCN9REzpHHWCGS5AVh49btFN13J",
      organization_id: "2115",
      campaign_id: "58",
      quest_type: "video",
      points: 20,
      started_at: "2025-07-20T15:02:28.597Z",
      payload: {
        video_id:
          "https://cdn.ddcdragon.com/1167/baear4iesobjdt6xb7o6kfb2cg7orxkytokcvdlebfav6z4l2vhjlumlo4q/pineappleV3.1.mp4",
        video_length: 82.083333,
        segment_length: "15",
        segments_watched: [0],
        last_watched_segment: 0,
      },
      completed_at: null,
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
        swapDetails: {
          fromToken: "ETH",
          toToken: "PAPPLE",
          fromAmount: "1.25",
          toAmount: "2450.75",
          tradingPair: "ETH/PAPPLE",
          usdValue: "$2,450",
        },
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
  },
}

interface EnrichedUserActivityProps {
  user: any
  onBack: () => void
}

export function EnrichedUserActivity({ user, onBack }: EnrichedUserActivityProps) {
  const [expandedQuests, setExpandedQuests] = useState<Set<string>>(new Set())

  // Process activity data
  const activities = Object.entries(mockEnrichedUserActivity.activities)
    .map(([timestamp, activity]) => ({
      ...activity,
      timestamp,
      duration: activity.completed_at
        ? differenceInMinutes(parseISO(activity.completed_at), parseISO(activity.started_at))
        : null,
    }))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  // Calculate comprehensive metrics
  const totalPoints = activities.reduce((sum, activity) => sum + activity.points, 0)
  const completedQuests = activities.filter((activity) => activity.completed_at).length
  const totalQuests = activities.length
  const completionRate = (completedQuests / totalQuests) * 100

  const questTypeStats = activities.reduce(
    (acc, activity) => {
      const type = activity.quest_type
      if (!acc[type]) {
        acc[type] = { count: 0, points: 0, completed: 0 }
      }
      acc[type].count++
      acc[type].points += activity.points
      if (activity.completed_at) acc[type].completed++
      return acc
    },
    {} as Record<string, { count: number; points: number; completed: number }>,
  )

  const avgCompletionTime =
    activities.filter((a) => a.duration).reduce((sum, a) => sum + (a.duration || 0), 0) /
    activities.filter((a) => a.duration).length

  const toggleQuestExpansion = (timestamp: string) => {
    const newExpanded = new Set(expandedQuests)
    if (newExpanded.has(timestamp)) {
      newExpanded.delete(timestamp)
    } else {
      newExpanded.add(timestamp)
    }
    setExpandedQuests(newExpanded)
  }

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

  const getQuestTitle = (activity: any) => {
    if (activity.quest_type === "quiz") return "Knowledge Quiz"
    if (activity.quest_type === "video") return "Video Learning"
    if (activity.quest_type === "custom") {
      if (activity.payload?.subtype === "wallet") return "Wallet Connection"
      if (activity.payload?.subtype === "dex") return "DEX Trading"
      if (activity.payload?.subtype === "x_connect") return "Social Connect"
    }
    return "Quest Activity"
  }

  const renderVideoProgress = (payload: any) => {
    if (!payload.segments_watched || !payload.video_length) return null

    const totalSegments = Math.ceil(payload.video_length / Number.parseInt(payload.segment_length))
    const watchedSegments = payload.segments_watched.length
    const progressPercentage = (watchedSegments / totalSegments) * 100

    return (
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Video Progress</span>
          <span>
            {watchedSegments}/{totalSegments} segments
          </span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
        <div className="text-xs text-muted-foreground">
          Duration: {Math.round(payload.video_length)}s • Last segment: {payload.last_watched_segment}
        </div>
      </div>
    )
  }

  const renderQuizDetails = (payload: any) => {
    if (!payload.answers) return null

    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          <span className="text-sm font-medium">{payload.answers.length} Questions Answered</span>
        </div>
        <div className="grid grid-cols-1 gap-1">
          {payload.answers.slice(0, 3).map((answer: any, index: number) => (
            <div key={index} className="text-xs bg-blue-50 dark:bg-blue-950/20 p-2 rounded flex items-center gap-2">
              <CheckCircle className="h-3 w-3 text-green-500" />
              <span>Question {index + 1} completed</span>
            </div>
          ))}
          {payload.answers.length > 3 && (
            <div className="text-xs text-muted-foreground">+{payload.answers.length - 3} more questions</div>
          )}
        </div>
      </div>
    )
  }

  const renderCustomQuestDetails = (payload: any) => {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4" />
          <span className="text-sm font-medium capitalize">{payload.subtype} Quest</span>
        </div>

        {payload.subtype === "dex" && payload.swapDetails && (
          <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <ArrowRightLeft className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800 dark:text-green-200">Swap Details</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-green-700 dark:text-green-300 font-medium">From:</span>
                <div className="text-green-800 dark:text-green-200">
                  {payload.swapDetails.fromAmount} {payload.swapDetails.fromToken}
                </div>
              </div>
              <div>
                <span className="text-green-700 dark:text-green-300 font-medium">To:</span>
                <div className="text-green-800 dark:text-green-200">
                  {payload.swapDetails.toAmount} {payload.swapDetails.toToken}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-xs bg-white dark:bg-gray-800">
                {payload.swapDetails.tradingPair}
              </Badge>
              <span className="text-sm font-bold text-green-800 dark:text-green-200">
                {payload.swapDetails.usdValue}
              </span>
            </div>
          </div>
        )}

        <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg space-y-1">
          <div className="text-xs font-medium text-green-800 dark:text-green-200">Event Flow:</div>
          <div className="text-xs text-green-700 dark:text-green-300 break-all">
            <span className="block sm:hidden">
              {payload.startEvent.length > 25 ? `${payload.startEvent.substring(0, 25)}...` : payload.startEvent} →{" "}
              {payload.completedEvent.length > 25
                ? `${payload.completedEvent.substring(0, 25)}...`
                : payload.completedEvent}
            </span>
            <span className="hidden sm:block">
              {payload.startEvent} → {payload.completedEvent}
            </span>
          </div>
          {payload.questId && (
            <div className="text-xs text-muted-foreground font-mono">
              ID:{" "}
              <span className="break-all">
                {payload.questId.length > 20 ? `${payload.questId.substring(0, 20)}...` : payload.questId}
              </span>
            </div>
          )}
        </div>
      </div>
    )
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
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="text-lg font-bold">
                {mockEnrichedUserActivity.username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight truncate">
                {mockEnrichedUserActivity.username}
              </h1>
              <p className="text-muted-foreground font-mono text-sm truncate">
                {mockEnrichedUserActivity.account_id.slice(0, 12)}...{mockEnrichedUserActivity.account_id.slice(-8)}
              </p>
            </div>
          </div>
        </div>

        {/* Enhanced Metrics Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Amount Traded</CardTitle>
              <Trophy className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700 dark:text-green-300">$2,450</div>
              <p className="text-xs text-green-600 dark:text-green-400">Following DEX swaps</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Preferred Quests</CardTitle>
              <Award className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-700 dark:text-orange-300 capitalize">
                {
                  Object.entries(questTypeStats).reduce((a, b) =>
                    questTypeStats[a[0]].count > questTypeStats[b[0]].count ? a : b,
                  )[0]
                }
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {Object.entries(questTypeStats)
                  .sort(([, a], [, b]) => b.count - a.count)
                  .map(([type, stats]) => (
                    <Badge key={type} variant="secondary" className="text-xs">
                      {type} ({stats.count})
                    </Badge>
                  ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800 sm:col-span-2 lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <BarChart3 className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{completionRate.toFixed(1)}%</div>
              <Progress value={completionRate} className="mt-2" />
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                {completedQuests}/{totalQuests} completed
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Activity Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Calendar className="h-5 w-5" />
              Activity Timeline
            </CardTitle>
            <CardDescription>Detailed quest completion journey with interactive elements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 sm:space-y-6">
              {activities.map((activity, index) => {
                const Icon = getQuestIcon(activity.quest_type, activity.payload?.subtype)
                const isCompleted = !!activity.completed_at
                const isExpanded = expandedQuests.has(activity.timestamp)

                return (
                  <div key={activity.timestamp} className="relative">
                    <div className="flex items-start gap-3 sm:gap-4">
                      {/* Quest Icon */}
                      <div
                        className={`flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full ${getQuestTypeColor(activity.quest_type)} relative z-10 shadow-lg flex-shrink-0`}
                      >
                        <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                      </div>

                      {/* Quest Content */}
                      <div className="flex-1 min-w-0">
                        <Card
                          className={`${isCompleted ? "border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20" : "border-orange-200 bg-orange-50/50 dark:border-orange-800 dark:bg-orange-950/20"}`}
                        >
                          <CardHeader className="pb-3">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                <div className="min-w-0 flex-1">
                                  <CardTitle className="text-base sm:text-lg truncate">
                                    {getQuestTitle(activity)}
                                  </CardTitle>
                                  <CardDescription className="flex items-center gap-2 mt-1">
                                    <Calendar className="h-3 w-3 flex-shrink-0" />
                                    <span className="truncate">
                                      {format(parseISO(activity.started_at), "MMM dd, yyyy 'at' HH:mm")}
                                    </span>
                                  </CardDescription>
                                </div>
                                <Badge variant={isCompleted ? "default" : "secondary"} className="ml-2 flex-shrink-0">
                                  {isCompleted ? (
                                    <>
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      <span className="hidden sm:inline">Completed</span>
                                      <span className="sm:hidden">Done</span>
                                    </>
                                  ) : (
                                    <>
                                      <XCircle className="h-3 w-3 mr-1" />
                                      <span className="hidden sm:inline">In Progress</span>
                                      <span className="sm:hidden">Progress</span>
                                    </>
                                  )}
                                </Badge>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <div className="font-bold text-xl sm:text-2xl text-green-600">+{activity.points}</div>
                                <div className="text-xs text-muted-foreground">points</div>
                              </div>
                            </div>
                          </CardHeader>

                          <CardContent className="space-y-4">
                            {/* Timing Information */}
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Started: {format(parseISO(activity.started_at), "HH:mm")}
                              </div>
                              {activity.completed_at && (
                                <>
                                  <div className="flex items-center gap-1">
                                    <CheckCircle className="h-3 w-3" />
                                    Completed: {format(parseISO(activity.completed_at), "HH:mm")}
                                  </div>
                                  {activity.duration && (
                                    <Badge variant="outline" className="text-xs w-fit">
                                      {activity.duration < 60
                                        ? `${activity.duration}m`
                                        : `${Math.round(activity.duration / 60)}h`}
                                    </Badge>
                                  )}
                                </>
                              )}
                            </div>

                            {/* Quest Type Specific Content */}
                            {activity.quest_type === "video" && renderVideoProgress(activity.payload)}
                            {activity.quest_type === "quiz" && renderQuizDetails(activity.payload)}
                            {activity.quest_type === "custom" && renderCustomQuestDetails(activity.payload)}

                            {/* Expandable Details */}
                            <Collapsible
                              open={isExpanded}
                              onOpenChange={() => toggleQuestExpansion(activity.timestamp)}
                            >
                              <CollapsibleTrigger asChild>
                                <Button variant="ghost" size="sm" className="w-full justify-between">
                                  <span>View Details</span>
                                  {isExpanded ? (
                                    <ChevronDown className="h-4 w-4" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4" />
                                  )}
                                </Button>
                              </CollapsibleTrigger>
                              <CollapsibleContent className="space-y-3 pt-3 border-t">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <span className="font-medium">Account ID:</span>
                                    <div className="font-mono text-xs break-all">{activity.account_id}</div>
                                  </div>
                                  <div>
                                    <span className="font-medium">Organization:</span>
                                    <div>{activity.organization_id}</div>
                                  </div>
                                </div>

                                {activity.payload?.video_id && (
                                  <div className="flex items-center gap-2 p-2 bg-purple-50 dark:bg-purple-950/20 rounded">
                                    <Video className="h-4 w-4 text-purple-600" />
                                    <span className="text-sm flex-1">Video Content Available</span>
                                    <Button size="sm" variant="outline" className="ml-auto bg-transparent">
                                      <ExternalLink className="h-3 w-3 mr-1" />
                                      <span className="hidden sm:inline">View</span>
                                    </Button>
                                  </div>
                                )}
                              </CollapsibleContent>
                            </Collapsible>
                          </CardContent>
                        </Card>
                      </div>
                    </div>

                    {/* Timeline connector */}
                    {index < activities.length - 1 && (
                      <div className="absolute left-5 sm:left-6 top-10 sm:top-12 h-6 sm:h-8 w-px bg-gradient-to-b from-gray-300 to-gray-200 dark:from-gray-600 dark:to-gray-700" />
                    )}
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
