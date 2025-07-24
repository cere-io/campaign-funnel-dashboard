import { MessageSquare, TrendingUp, Users, Hash, Heart, AlertTriangle, CheckCircle } from "lucide-react"
import { format } from "date-fns"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Progress } from "../components/ui/progress"
import { Avatar, AvatarFallback } from "../components/ui/avatar"
import { ScrollArea } from "../components/ui/scroll-area"

interface CommunityIntelligenceProps {
  data: any
}

export function CommunityIntelligence({ data }: CommunityIntelligenceProps) {
  // Handle the nested data structure from our API
  const communityData = data?.result?.data ?? data ?? null

  if (!communityData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading community data...</div>
      </div>
    )
  }

  const sentimentData = communityData?.sentiment_analysis ?? {
    positive_messages: 0,
    negative_messages: 0,
    neutral_messages: 0,
    average_sentiment_confidence: 0,
    sentiment_by_user: [],
  }

  const topicsData = (communityData?.topics ?? []).filter((t: any) => t.message_count > 0)
  const usersData = communityData?.users_summary ?? []
  const assignments = communityData?.assignments_summary ?? []

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "text-green-600"
      case "negative":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return CheckCircle
      case "negative":
        return AlertTriangle
      default:
        return MessageSquare
    }
  }

  return (
    <div className="space-y-6">
      {/* Sentiment Analysis */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Sentiment Analysis
            </CardTitle>
            <CardDescription>Community mood and engagement sentiment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{sentimentData.positive_messages}</div>
                <div className="text-xs text-muted-foreground">Positive</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">{sentimentData.neutral_messages}</div>
                <div className="text-xs text-muted-foreground">Neutral</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{sentimentData.negative_messages}</div>
                <div className="text-xs text-muted-foreground">Negative</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Overall Sentiment</span>
                <span>
                  {(
                    (sentimentData.positive_messages /
                      (sentimentData.positive_messages + sentimentData.negative_messages)) *
                    100
                  ).toFixed(1)}
                  % Positive
                </span>
              </div>
              <Progress
                value={
                  (sentimentData.positive_messages /
                    (sentimentData.positive_messages + sentimentData.negative_messages)) *
                  100
                }
                className="h-2"
              />
            </div>

            <div className="text-xs text-muted-foreground">
              Average Confidence: {(sentimentData.average_sentiment_confidence * 100).toFixed(1)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hash className="h-5 w-5" />
              Topic Distribution
            </CardTitle>
            <CardDescription>Active discussion topics and engagement</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topicsData.map((topic: any) => (
                <div key={topic.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-medium">{topic.name}</div>
                    {topic.is_new && (
                      <Badge variant="secondary" className="text-xs">
                        New
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {topic.message_count} messages
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Activity & Recent Messages */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Active Users
            </CardTitle>
            <CardDescription>Users contributing to community discussions</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-3">
                {(sentimentData.sentiment_by_user ?? []).map((user: any) => {
                  const totalMessages = user.positive_count + user.negative_count + user.neutral_count
                  const positiveRatio = totalMessages > 0 ? (user.positive_count / totalMessages) * 100 : 0

                  return (
                    <div key={user.user_id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">{user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-sm">{user.username}</div>
                          <div className="text-xs text-muted-foreground">
                            {totalMessages} messages • {positiveRatio.toFixed(0)}% positive
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {user.positive_count > 0 && (
                          <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                            +{user.positive_count}
                          </Badge>
                        )}
                        {user.negative_count > 0 && (
                          <Badge variant="secondary" className="text-xs bg-red-100 text-red-800">
                            -{user.negative_count}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest community messages and sentiment</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-3">
                {assignments.map((assignment: any) => {
                  const SentimentIcon = getSentimentIcon(assignment.sentiment)

                  return (
                    <div key={assignment.message_id} className="p-3 rounded-lg border space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              {assignment.user.username.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">{assignment.user.username}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <SentimentIcon className={`h-4 w-4 ${getSentimentColor(assignment.sentiment)}`} />
                          <Badge variant="outline" className="text-xs">
                            {assignment.topic_name}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">{assignment.message_preview}</div>
                      <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <span>Confidence: {(assignment.topic_confidence * 100).toFixed(1)}%</span>
                        {assignment.is_new_topic && (
                          <Badge variant="secondary" className="text-xs">
                            New Topic
                          </Badge>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Processing Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Processing Summary
          </CardTitle>
          <CardDescription>Latest batch processing results</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{communityData.processing_summary?.total_messages}</div>
              <div className="text-xs text-muted-foreground">Messages Processed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{communityData.processing_summary?.new_topics_created}</div>
              <div className="text-xs text-muted-foreground">New Topics Created</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{communityData.processing_summary?.existing_topics_used}</div>
              <div className="text-xs text-muted-foreground">Existing Topics Used</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{communityData.processing_summary?.total_users}</div>
              <div className="text-xs text-muted-foreground">Active Users</div>
            </div>
          </div>
          <div className="mt-4 text-xs text-muted-foreground">
            Last processed: {format(new Date(communityData.processing_summary?.timestamp), "MMM dd, yyyy 'at' HH:mm")}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
