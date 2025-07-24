import React from "react"
import {
  TrendingUp,
  Users,
  Wallet,
  CheckCircle,
  MessageSquare,
  Heart,
  Activity,
  Hash,
} from "lucide-react"
import { format, subDays } from "date-fns"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"
import { FunnelChart } from "../funnel-chart"
import { TrendChart } from "../trend-chart"
import { KPICard } from "../kpi-card"
import { api, type FunnelData, type CommunityData, type HistoricalData } from "../../lib/api"

interface OverviewViewProps {
  selectedCampaign: string
  dateRange: { from: Date; to: Date }
  isLoading: boolean
}

// Mock data based on the API response - ensure these numbers are used consistently
const mockData = {
  startedDexSwap: 64,
  connectedCereWallet: 10,
  completedTrade: 5,
  executedAt: "2025-07-22T10:45:57.024Z",
};

// Mock community intelligence data
const mockCommunityData: CommunityData = {
  result: {
    code: "SUCCESS",
    data: {
      processing_summary: {
        timestamp: "2025-07-22T19:57:24.708Z",
        total_messages: 5,
        total_topics: 18,
        new_topics_created: 2,
        existing_topics_used: 16,
        total_users: 5,
      },
      users_summary: [
        {
          user_id: 105,
          username: "frustrated_user",
          messages_in_batch: 1,
          messages_assigned: 1,
        },
        {
          user_id: 104,
          username: "react_dev",
          messages_in_batch: 1,
          messages_assigned: 1,
        },
        {
          user_id: 103,
          username: "ai_researcher",
          messages_in_batch: 1,
          messages_assigned: 1,
        },
        {
          user_id: 102,
          username: "sports_fan",
          messages_in_batch: 1,
          messages_assigned: 1,
        },
        {
          user_id: 101,
          username: "webdev_enthusiast",
          messages_in_batch: 1,
          messages_assigned: 1,
        },
      ],
      sentiment_analysis: {
        positive_messages: 4,
        negative_messages: 1,
        neutral_messages: 0,
        average_sentiment_confidence: 0.6795238095238095,
        sentiment_by_user: [
          {
            user_id: 105,
            username: "frustrated_user",
            positive_count: 0,
            negative_count: 1,
            neutral_count: 0,
            average_confidence: 0.8333333333333333,
          },
          {
            user_id: 104,
            username: "react_dev",
            positive_count: 1,
            negative_count: 0,
            neutral_count: 0,
            average_confidence: 0.5714285714285714,
          },
          {
            user_id: 103,
            username: "ai_researcher",
            positive_count: 1,
            negative_count: 0,
            neutral_count: 0,
            average_confidence: 0.6,
          },
          {
            user_id: 102,
            username: "sports_fan",
            positive_count: 1,
            negative_count: 0,
            neutral_count: 0,
            average_confidence: 0.6428571428571428,
          },
          {
            user_id: 101,
            username: "webdev_enthusiast",
            positive_count: 1,
            negative_count: 0,
            neutral_count: 0,
            average_confidence: 0.75,
          },
        ],
      },
      topics: [
        {
          id: 16,
          name: "General Discussion",
          keywords: ["general", "discussion", "chat"],
          is_new: false,
          message_count: 1,
        },
        {
          id: 15,
          name: "Programming & Development",
          keywords: ["programming", "development", "code"],
          is_new: false,
          message_count: 1,
        },
        {
          id: 17,
          name: "General Discussion",
          keywords: ["general", "discussion", "chat"],
          is_new: true,
          message_count: 1,
        },
        {
          id: 18,
          name: "General Discussion",
          keywords: ["general", "discussion", "chat"],
          is_new: true,
          message_count: 1,
        },
      ],
      assignments_summary: [
        {
          message_id: 589888,
          topic_id: 17,
          topic_name: "General Discussion",
          topic_confidence: 1,
          is_new_topic: true,
          message_preview:
            "I hate this new update, it's terrible! Everything ...",
          user: {
            id: 105,
            username: "frustrated_user",
          },
          sentiment: "negative",
        },
        {
          message_id: 388548,
          topic_id: 14,
          topic_name: "General Discussion",
          topic_confidence: 0.7924247812140777,
          is_new_topic: false,
          message_preview:
            "React hooks are so much better than class componen...",
          user: {
            id: 104,
            username: "react_dev",
          },
          sentiment: "positive",
        },
        {
          message_id: 639454,
          topic_id: 18,
          topic_name: "General Discussion",
          topic_confidence: 1,
          is_new_topic: true,
          message_preview:
            "This new AI research paper on neural networks is g...",
          user: {
            id: 103,
            username: "ai_researcher",
          },
          sentiment: "positive",
        },
        {
          message_id: 635246,
          topic_id: 15,
          topic_name: "Programming & Development",
          topic_confidence: 0.7207983471776482,
          is_new_topic: false,
          message_preview:
            "The football game last night was incredible! What ...",
          user: {
            id: 102,
            username: "sports_fan",
          },
          sentiment: "positive",
        },
        {
          message_id: 408202,
          topic_id: 16,
          topic_name: "General Discussion",
          topic_confidence: 0.7745326521381823,
          is_new_topic: false,
          message_preview:
            "I absolutely love this new JavaScript framework! I...",
          user: {
            id: 101,
            username: "webdev_enthusiast",
          },
          sentiment: "positive",
        },
      ],
    },
  },
};

// Generate mock historical data for trends
const generateHistoricalData = () => {
  const data = [];
  for (let i = 6; i >= 0; i--) {
    const date = subDays(new Date(), i);
    data.push({
      date: format(date, "yyyy-MM-dd"),
      startedDexSwap: Math.floor(Math.random() * 30) + 40,
      connectedCereWallet: Math.floor(Math.random() * 8) + 6,
      completedTrade: Math.floor(Math.random() * 4) + 3,
    });
  }
  return data;
};

export function OverviewView({ selectedCampaign, dateRange, isLoading }: OverviewViewProps) {
  const [funnelData, setFunnelData] = React.useState<FunnelData | null>(null)
  const [communityData, setCommunityData] = React.useState<CommunityData | null>(null)
  const [historicalData, setHistoricalData] = React.useState<HistoricalData[]>([])

  React.useEffect(() => {
    const loadData = async () => {
      try {
        // Use mock data for now since API might not be available
        setFunnelData(mockData)
        setCommunityData(mockCommunityData)
        setHistoricalData(generateHistoricalData())
      } catch (error) {
        console.error("Failed to load overview data:", error)
      }
    }

    loadData()
  }, [selectedCampaign])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading overview...</div>
      </div>
    )
  }

  // Calculate community metrics
  const communityDataForDisplay = communityData?.result.data || mockCommunityData.result.data;
  const sentimentScore = (
    (communityDataForDisplay.sentiment_analysis.positive_messages /
      (communityDataForDisplay.sentiment_analysis.positive_messages +
        communityDataForDisplay.sentiment_analysis.negative_messages)) *
    100
  ).toFixed(1);

  const handleFunnelStageClick = (stage: string, count: number) => {
    // This would be handled by parent component
    console.log("Funnel stage clicked:", stage, count);
  };

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Enhanced KPI Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-50 via-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -mr-10 -mt-10" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Completed Trades
            </CardTitle>
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <CheckCircle className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold text-blue-900 dark:text-blue-100">
              {funnelData?.completedTrade || mockData.completedTrade}
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-xs text-green-600 font-medium">+8.1%</span>
              <span className="text-xs text-muted-foreground ml-2">
                vs last period
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-green-50 via-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
          <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full -mr-10 -mt-10" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">
              Active Users
            </CardTitle>
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Users className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold text-green-900 dark:text-green-100">
              {communityDataForDisplay.processing_summary.total_users}
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-xs text-green-600 font-medium">+15.2%</span>
              <span className="text-xs text-muted-foreground ml-2">
                engaging now
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-purple-50 via-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
          <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full -mr-10 -mt-10" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">
              Sentiment Score
            </CardTitle>
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Heart className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold text-purple-900 dark:text-purple-100">
              {sentimentScore}%
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-xs text-green-600 font-medium">+12.3%</span>
              <span className="text-xs text-muted-foreground ml-2">
                positive ratio
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-orange-50 via-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
          <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/10 rounded-full -mr-10 -mt-10" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">
              Messages
            </CardTitle>
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <MessageSquare className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold text-orange-900 dark:text-orange-100">
              {communityDataForDisplay.processing_summary.total_messages}
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-xs text-green-600 font-medium">+8.7%</span>
              <span className="text-xs text-muted-foreground ml-2">
                processed
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Charts Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-0 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg md:text-xl font-semibold">
                  Campaign Performance
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground mt-1">
                  User progression through funnel stages
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <FunnelChart
              data={funnelData || mockData}
              onStageClick={handleFunnelStageClick}
            />
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg md:text-xl font-semibold">
              Community Pulse
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground mt-1">
              Real-time sentiment analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="relative">
              <div className="flex items-center justify-center">
                <div className="relative w-28 h-28 sm:w-32 sm:h-32">
                  <svg
                    className="w-28 h-28 sm:w-32 sm:h-32 transform -rotate-90"
                    viewBox="0 0 36 36"
                  >
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="2"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2"
                      strokeDasharray={`${sentimentScore}, 100`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-xl sm:text-2xl font-bold text-green-600">
                        {sentimentScore}%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Positive
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                  <span className="text-sm">Positive</span>
                </div>
                <span className="text-sm font-medium">
                  {communityDataForDisplay.sentiment_analysis.positive_messages}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-400 rounded-full" />
                  <span className="text-sm">Neutral</span>
                </div>
                <span className="text-sm font-medium">
                  {communityDataForDisplay.sentiment_analysis.neutral_messages}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full" />
                  <span className="text-sm">Negative</span>
                </div>
                <span className="text-sm font-medium">
                  {communityDataForDisplay.sentiment_analysis.negative_messages}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Activity Feed */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg md:text-xl font-semibold flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Live Activity Feed
            </CardTitle>
            <CardDescription>
              Recent user interactions and sentiment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {communityDataForDisplay.assignments_summary
                ?.slice(0, 4)
                .map((activity: any, index: number) => (
                  <div
                    key={activity.message_id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div
                      className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                        activity.sentiment === "positive"
                          ? "bg-green-500"
                          : activity.sentiment === "negative"
                            ? "bg-red-500"
                            : "bg-gray-400"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                        <span className="text-sm font-medium">
                          {activity.user.username}
                        </span>
                        <Badge variant="outline" className="text-xs w-fit">
                          {activity.topic_name}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {activity.message_preview}
                      </p>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2">
                        <span className="text-xs text-muted-foreground">
                          Confidence:{" "}
                          {(activity.topic_confidence * 100).toFixed(0)}%
                        </span>
                        {activity.is_new_topic && (
                          <Badge variant="secondary" className="text-xs w-fit">
                            New Topic
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg md:text-xl font-semibold flex items-center gap-2">
              <Hash className="h-5 w-5" />
              Trending Topics
            </CardTitle>
            <CardDescription>Most active discussion topics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {communityDataForDisplay.topics
                ?.filter((t: any) => t.message_count > 0)
                .map((topic: any, index: number) => (
                  <div
                    key={topic.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-medium text-primary">
                          #{index + 1}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-sm truncate">
                          {topic.name}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {topic.keywords?.slice(0, 3).join(", ")}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {topic.is_new && (
                        <Badge variant="secondary" className="text-xs">
                          New
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {topic.message_count} msgs
                      </Badge>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 