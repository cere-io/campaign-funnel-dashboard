"use client"

import { useState } from "react"
import {
  MessageSquare,
  TrendingUp,
  Users,
  Hash,
  Heart,
  AlertTriangle,
  CheckCircle,
  Filter,
  Search,
  MoreHorizontal,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Clock,
  Zap,
  Target,
  Activity,
} from "lucide-react"
import { format } from "date-fns"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Progress } from "../components/ui/progress"
import { Avatar, AvatarFallback } from "../components/ui/avatar"
import { ScrollArea } from "../components/ui/scroll-area"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"

interface EnhancedCommunityIntelligenceProps {
  data: any
}

export function EnhancedCommunityIntelligence({ data }: EnhancedCommunityIntelligenceProps) {
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTimeframe, setSelectedTimeframe] = useState("24h")

  const sentimentData = data?.sentiment_analysis ?? {
    positive_messages: 0,
    negative_messages: 0,
    neutral_messages: 0,
    average_sentiment_confidence: 0,
    sentiment_by_user: [],
  }

  const topicsData = (data?.topics ?? []).filter((t: any) => t.message_count > 0)
  const usersData = data?.users_summary ?? []
  const assignments = data?.assignments_summary ?? []

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

  const getSentimentBg = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800"
      case "negative":
        return "bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800"
      default:
        return "bg-gray-50 border-gray-200 dark:bg-gray-950/20 dark:border-gray-800"
    }
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Enhanced Header with Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl md:text-2xl font-bold">Community Intelligence</h2>
          <p className="text-muted-foreground">Real-time community sentiment and engagement analysis</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full sm:w-64"
            />
          </div>
          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
            <SelectTrigger className="w-full sm:w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">1 Hour</SelectItem>
              <SelectItem value="24h">24 Hours</SelectItem>
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="w-full sm:w-auto bg-transparent">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {/* Enhanced Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Engagement</CardTitle>
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Activity className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold text-blue-900 dark:text-blue-100">
              {data.processing_summary.total_messages}
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-xs text-green-600 font-medium">+23.5%</span>
              <span className="text-xs text-muted-foreground ml-2">vs yesterday</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">Sentiment Health</CardTitle>
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Heart className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold text-green-900 dark:text-green-100">
              {(
                (sentimentData.positive_messages /
                  (sentimentData.positive_messages + sentimentData.negative_messages)) *
                100
              ).toFixed(0)}
              %
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-xs text-green-600 font-medium">+12.3%</span>
              <span className="text-xs text-muted-foreground ml-2">positive ratio</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">Active Topics</CardTitle>
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Hash className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold text-purple-900 dark:text-purple-100">
              {data.processing_summary.total_topics}
            </div>
            <div className="flex items-center mt-2">
              <Zap className="h-3 w-3 text-orange-500 mr-1" />
              <span className="text-xs text-orange-600 font-medium">
                {data.processing_summary.new_topics_created} new
              </span>
              <span className="text-xs text-muted-foreground ml-2">this period</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">Response Time</CardTitle>
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <Clock className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold text-orange-900 dark:text-orange-100">2.3m</div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-xs text-green-600 font-medium">-15.2%</span>
              <span className="text-xs text-muted-foreground ml-2">avg response</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Content Tabs */}
      <Tabs defaultValue="sentiment" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="sentiment" className="text-xs sm:text-sm">
            Sentiment
          </TabsTrigger>
          <TabsTrigger value="topics" className="text-xs sm:text-sm">
            Topics
          </TabsTrigger>
          <TabsTrigger value="users" className="text-xs sm:text-sm">
            Users
          </TabsTrigger>
          <TabsTrigger value="messages" className="text-xs sm:text-sm">
            Messages
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sentiment" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Heart className="h-5 w-5" />
                  Sentiment Distribution
                </CardTitle>
                <CardDescription>Community mood breakdown with confidence levels</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="relative">
                  <div className="flex items-center justify-center">
                    <div className="relative w-32 h-32 sm:w-40 sm:h-40">
                      <svg className="w-32 h-32 sm:w-40 sm:h-40 transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#e5e7eb"
                          strokeWidth="3"
                        />
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="3"
                          strokeDasharray={`${(sentimentData.positive_messages / (sentimentData.positive_messages + sentimentData.negative_messages)) * 100}, 100`}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-2xl sm:text-3xl font-bold text-green-600">
                            {(
                              (sentimentData.positive_messages /
                                (sentimentData.positive_messages + sentimentData.negative_messages)) *
                              100
                            ).toFixed(0)}
                            %
                          </div>
                          <div className="text-sm text-muted-foreground">Positive</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 border border-green-200 dark:bg-green-950/20 dark:border-green-800">
                    <div className="flex items-center gap-3">
                      <ThumbsUp className="h-5 w-5 text-green-600" />
                      <div>
                        <div className="font-medium text-green-900 dark:text-green-100">Positive Messages</div>
                        <div className="text-sm text-green-700 dark:text-green-300">High engagement & satisfaction</div>
                      </div>
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-green-600">
                      {sentimentData.positive_messages}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-red-50 border border-red-200 dark:bg-red-950/20 dark:border-red-800">
                    <div className="flex items-center gap-3">
                      <ThumbsDown className="h-5 w-5 text-red-600" />
                      <div>
                        <div className="font-medium text-red-900 dark:text-red-100">Negative Messages</div>
                        <div className="text-sm text-red-700 dark:text-red-300">Issues requiring attention</div>
                      </div>
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-red-600">{sentimentData.negative_messages}</div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-200 dark:bg-gray-950/20 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="h-5 w-5 text-gray-600" />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">Neutral Messages</div>
                        <div className="text-sm text-gray-700 dark:text-gray-300">Informational content</div>
                      </div>
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-gray-600">{sentimentData.neutral_messages}</div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Average Confidence</span>
                    <span className="font-medium">
                      {(sentimentData.average_sentiment_confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={sentimentData.average_sentiment_confidence * 100} className="mt-2" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="h-5 w-5" />
                  User Sentiment Breakdown
                </CardTitle>
                <CardDescription>Individual user sentiment patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {(sentimentData.sentiment_by_user ?? []).map((user: any) => {
                      const totalMessages = user.positive_count + user.negative_count + user.neutral_count
                      const positiveRatio = totalMessages > 0 ? (user.positive_count / totalMessages) * 100 : 0

                      return (
                        <div
                          key={user.user_id}
                          className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback className="text-sm font-medium">
                                  {user.username.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0 flex-1">
                                <div className="font-medium truncate">{user.username}</div>
                                <div className="text-sm text-muted-foreground">
                                  {totalMessages} messages • {positiveRatio.toFixed(0)}% positive
                                </div>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm" className="flex-shrink-0">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="grid grid-cols-3 gap-2">
                            {user.positive_count > 0 && (
                              <Badge variant="secondary" className="bg-green-100 text-green-800 justify-center text-xs">
                                +{user.positive_count}
                              </Badge>
                            )}
                            {user.neutral_count > 0 && (
                              <Badge variant="secondary" className="bg-gray-100 text-gray-800 justify-center text-xs">
                                ={user.neutral_count}
                              </Badge>
                            )}
                            {user.negative_count > 0 && (
                              <Badge variant="secondary" className="bg-red-100 text-red-800 justify-center text-xs">
                                -{user.negative_count}
                              </Badge>
                            )}
                          </div>

                          <div className="mt-3">
                            <div className="flex justify-between text-xs text-muted-foreground mb-1">
                              <span>Sentiment Score</span>
                              <span>{positiveRatio.toFixed(0)}%</span>
                            </div>
                            <Progress value={positiveRatio} className="h-2" />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="topics" className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Hash className="h-5 w-5" />
                Topic Analysis & Trends
              </CardTitle>
              <CardDescription>Active discussion topics and their engagement levels</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topicsData.map((topic: any, index: number) => (
                  <div key={topic.id} className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-primary">#{index + 1}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-base sm:text-lg truncate">{topic.name}</div>
                          <div className="text-sm text-muted-foreground truncate">
                            Keywords: {topic.keywords?.join(", ")}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {topic.is_new && (
                          <Badge className="bg-orange-100 text-orange-800 text-xs">
                            <Zap className="h-3 w-3 mr-1" />
                            New
                          </Badge>
                        )}
                        <Badge variant="outline" className="font-medium text-xs">
                          {topic.message_count} messages
                        </Badge>
                        <Button variant="ghost" size="sm" className="hidden sm:flex">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Target className="h-4 w-4" />
                        <span>Engagement: High</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4" />
                        <span>Trending: +15%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages" className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageSquare className="h-5 w-5" />
                Live Message Feed
              </CardTitle>
              <CardDescription>Real-time community messages with sentiment analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] sm:h-[600px]">
                <div className="space-y-4">
                  {assignments.map((message: any) => {
                    const SentimentIcon = getSentimentIcon(message.sentiment)

                    return (
                      <div
                        key={message.message_id}
                        className={`p-4 rounded-lg border ${getSentimentBg(message.sentiment)} hover:shadow-md transition-shadow`}
                      >
                        <div className="flex items-start gap-3">
                          <Avatar className="h-10 w-10 flex-shrink-0">
                            <AvatarFallback className="text-sm">
                              {message.user.username.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                              <span className="font-medium">{message.user.username}</span>
                              <Badge variant="outline" className="text-xs w-fit">
                                {message.topic_name}
                              </Badge>
                              <div className="flex items-center gap-1">
                                <SentimentIcon className={`h-4 w-4 ${getSentimentColor(message.sentiment)}`} />
                                <span className={`text-xs font-medium ${getSentimentColor(message.sentiment)}`}>
                                  {message.sentiment}
                                </span>
                              </div>
                            </div>

                            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
                              {message.message_preview}
                            </p>

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-muted-foreground">
                                <span>Confidence: {(message.topic_confidence * 100).toFixed(0)}%</span>
                                {message.is_new_topic && (
                                  <Badge variant="secondary" className="text-xs w-fit">
                                    New Topic
                                  </Badge>
                                )}
                              </div>
                              <Button variant="ghost" size="sm" className="text-xs w-fit">
                                View Thread
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Processing Summary */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="h-5 w-5" />
            Processing Summary
          </CardTitle>
          <CardDescription>Latest batch processing results and system performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div className="text-center p-3 sm:p-4 rounded-lg bg-white/50 dark:bg-white/5">
              <div className="text-2xl sm:text-3xl font-bold text-blue-600">
                {data.processing_summary.total_messages}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground mt-1">Messages Processed</div>
            </div>
            <div className="text-center p-3 sm:p-4 rounded-lg bg-white/50 dark:bg-white/5">
              <div className="text-2xl sm:text-3xl font-bold text-green-600">
                {data.processing_summary.new_topics_created}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground mt-1">New Topics Created</div>
            </div>
            <div className="text-center p-3 sm:p-4 rounded-lg bg-white/50 dark:bg-white/5">
              <div className="text-2xl sm:text-3xl font-bold text-purple-600">
                {data.processing_summary.existing_topics_used}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground mt-1">Existing Topics Used</div>
            </div>
            <div className="text-center p-3 sm:p-4 rounded-lg bg-white/50 dark:bg-white/5">
              <div className="text-2xl sm:text-3xl font-bold text-orange-600">
                {data.processing_summary.total_users}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground mt-1">Active Users</div>
            </div>
          </div>
          <div className="mt-4 sm:mt-6 pt-4 border-t text-center">
            <div className="text-sm text-muted-foreground">
              Last processed: {format(new Date(data.processing_summary.timestamp), "MMM dd, yyyy 'at' HH:mm:ss")}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
