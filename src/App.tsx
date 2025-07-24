import { useState } from "react"
import {
  CalendarIcon,
  RefreshCw,
  TrendingUp,
  Users,
  Wallet,
  CheckCircle,
  MessageSquare,
  Heart,
  BarChart3,
  Activity,
  Home,
  Hash,
  Moon,
  Sun,
  Menu,
} from "lucide-react"
import { format, subDays } from "date-fns"

import { Button } from "./components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select"
import { Badge } from "./components/ui/badge"
import { Calendar } from "./components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "./components/ui/popover"
import { Sheet, SheetContent } from "./components/ui/sheet"

import { FunnelChart } from "./components/funnel-chart"
import { TrendChart } from "./components/trend-chart"
import { KPICard } from "./components/kpi-card"
import { UsersList } from "./components/users-list"
import { UserActivityDetail } from "./components/user-activity-detail"

// Mock data based on the API response - ensure these numbers are used consistently
const mockData = {
  startedDexSwap: 64,
  connectedCereWallet: 10,
  completedTrade: 5,
  executedAt: "2025-07-22T10:45:57.024Z",
}

// Mock community intelligence data
const mockCommunityData = {
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
          message_preview: "I hate this new update, it's terrible! Everything ...",
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
          message_preview: "React hooks are so much better than class componen...",
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
          message_preview: "This new AI research paper on neural networks is g...",
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
          message_preview: "The football game last night was incredible! What ...",
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
          message_preview: "I absolutely love this new JavaScript framework! I...",
          user: {
            id: 101,
            username: "webdev_enthusiast",
          },
          sentiment: "positive",
        },
      ],
    },
  },
}

// Generate mock historical data for trends
const generateHistoricalData = () => {
  const data = []
  for (let i = 6; i >= 0; i--) {
    const date = subDays(new Date(), i)
    data.push({
      date: format(date, "yyyy-MM-dd"),
      startedDexSwap: Math.floor(Math.random() * 30) + 40,
      connectedCereWallet: Math.floor(Math.random() * 8) + 6,
      completedTrade: Math.floor(Math.random() * 4) + 3,
    })
  }
  return data
}

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
    id: "users",
  },
]

function AppSidebar({
  activeView,
  onViewChange,
  className = "",
}: {
  activeView: string
  onViewChange: (view: string) => void
  className?: string
}) {
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
          <div className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Navigation</div>
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
              <span className="font-medium">{mockCommunityData.result.data.processing_summary.total_users}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Messages</span>
              <span className="font-medium">{mockCommunityData.result.data.processing_summary.total_messages}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Completed Trades</span>
              <span className="font-medium">{mockData.completedTrade}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Sentiment</span>
              <span className="font-medium text-green-600">
                {(
                  (mockCommunityData.result.data.sentiment_analysis.positive_messages /
                    (mockCommunityData.result.data.sentiment_analysis.positive_messages +
                      mockCommunityData.result.data.sentiment_analysis.negative_messages)) *
                  100
                ).toFixed(0)}
                %
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ThemeToggle() {
  const [theme, setTheme] = useState("dark")

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="w-9 px-0"
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}

export default function CommunityIntelligenceDashboard() {
  const [selectedCampaign, setSelectedCampaign] = useState("58")
  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 7),
    to: new Date(),
  })
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(new Date(mockData.executedAt))
  const [historicalData] = useState(generateHistoricalData())
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [selectedView, setSelectedView] = useState<"dashboard" | "users" | "user-detail">("dashboard")
  const [selectedFunnelStage, setSelectedFunnelStage] = useState<string | null>(null)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [activeView, setActiveView] = useState("overview")

  // Calculate conversion rates
  const startedToConnected = ((mockData.connectedCereWallet / mockData.startedDexSwap) * 100).toFixed(1)
  const startedToCompleted = ((mockData.completedTrade / mockData.startedDexSwap) * 100).toFixed(1)
  const connectedToCompleted = ((mockData.completedTrade / mockData.connectedCereWallet) * 100).toFixed(1)

  // Calculate community metrics
  const communityData = mockCommunityData.result.data
  const sentimentScore = (
    (communityData.sentiment_analysis.positive_messages /
      (communityData.sentiment_analysis.positive_messages + communityData.sentiment_analysis.negative_messages)) *
    100
  ).toFixed(1)

  // Check data freshness
  const getDataFreshnessStatus = () => {
    const now = new Date()
    const diffMinutes = (now.getTime() - lastUpdated.getTime()) / (1000 * 60)

    if (diffMinutes > 120) return { status: "stale", color: "destructive" }
    if (diffMinutes > 30) return { status: "warning", color: "warning" }
    return { status: "fresh", color: "success" }
  }

  const freshnessStatus = getDataFreshnessStatus()

  const refreshData = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setLastUpdated(new Date())
    setIsLoading(false)
  }

  const exportData = (format: "csv" | "xlsx") => {
    // Mock export functionality
    console.log(`Exporting data as ${format}`)
  }

  const handleKPIClick = (stage: string) => {
    setSelectedFunnelStage(stage)
    setSelectedView("users")
  }

  const handleFunnelStageClick = (stage: string, count: number) => {
    // Map funnel stage names to the same format used by KPI cards
    let mappedStage = stage
    if (stage === "Started DEX Swap") mappedStage = "startedDexSwap"
    if (stage === "Connected Wallet") mappedStage = "connectedCereWallet"
    if (stage === "Completed Trade") mappedStage = "completedTrade"

    setSelectedFunnelStage(mappedStage)
    setSelectedView("users")
  }

  // Enhanced Overview Function
  const renderEnhancedOverview = () => (
    <div className="space-y-6 md:space-y-8">
      {/* Enhanced KPI Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-50 via-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -mr-10 -mt-10" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">Completed Trades</CardTitle>
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <CheckCircle className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold text-blue-900 dark:text-blue-100">
              {mockData.completedTrade}
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-xs text-green-600 font-medium">+8.1%</span>
              <span className="text-xs text-muted-foreground ml-2">vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-green-50 via-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
          <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full -mr-10 -mt-10" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">Active Users</CardTitle>
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Users className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold text-green-900 dark:text-green-100">
              {communityData.processing_summary.total_users}
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-xs text-green-600 font-medium">+15.2%</span>
              <span className="text-xs text-muted-foreground ml-2">engaging now</span>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-purple-50 via-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
          <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full -mr-10 -mt-10" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">Sentiment Score</CardTitle>
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Heart className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold text-purple-900 dark:text-purple-100">{sentimentScore}%</div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-xs text-green-600 font-medium">+12.3%</span>
              <span className="text-xs text-muted-foreground ml-2">positive ratio</span>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-orange-50 via-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
          <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/10 rounded-full -mr-10 -mt-10" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">Messages</CardTitle>
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <MessageSquare className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold text-orange-900 dark:text-orange-100">
              {communityData.processing_summary.total_messages}
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-xs text-green-600 font-medium">+8.7%</span>
              <span className="text-xs text-muted-foreground ml-2">processed</span>
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
                <CardTitle className="text-lg md:text-xl font-semibold">Campaign Performance</CardTitle>
                <CardDescription className="text-sm text-muted-foreground mt-1">
                  User progression through funnel stages
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="text-xs bg-transparent">
                  Export
                </Button>
                <Button variant="outline" size="sm" className="text-xs bg-transparent">
                  Share
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <FunnelChart data={mockData} onStageClick={handleFunnelStageClick} />
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg md:text-xl font-semibold">Community Pulse</CardTitle>
            <CardDescription className="text-sm text-muted-foreground mt-1">
              Real-time sentiment analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="relative">
              <div className="flex items-center justify-center">
                <div className="relative w-28 h-28 sm:w-32 sm:h-32">
                  <svg className="w-28 h-28 sm:w-32 sm:h-32 transform -rotate-90" viewBox="0 0 36 36">
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
                      <div className="text-xl sm:text-2xl font-bold text-green-600">{sentimentScore}%</div>
                      <div className="text-xs text-muted-foreground">Positive</div>
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
                <span className="text-sm font-medium">{communityData.sentiment_analysis.positive_messages}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-400 rounded-full" />
                  <span className="text-sm">Neutral</span>
                </div>
                <span className="text-sm font-medium">{communityData.sentiment_analysis.neutral_messages}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full" />
                  <span className="text-sm">Negative</span>
                </div>
                <span className="text-sm font-medium">{communityData.sentiment_analysis.negative_messages}</span>
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
            <CardDescription>Recent user interactions and sentiment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {communityData.assignments_summary?.slice(0, 4).map((activity: any, index: number) => (
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
                      <span className="text-sm font-medium">{activity.user.username}</span>
                      <Badge variant="outline" className="text-xs w-fit">
                        {activity.topic_name}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{activity.message_preview}</p>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2">
                      <span className="text-xs text-muted-foreground">
                        Confidence: {(activity.topic_confidence * 100).toFixed(0)}%
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
              {communityData.topics
                ?.filter((t: any) => t.message_count > 0)
                .map((topic: any, index: number) => (
                  <div
                    key={topic.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-medium text-primary">#{index + 1}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-sm truncate">{topic.name}</div>
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

  const renderFunnelView = () => (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <KPICard
          title="Started DEX Swap"
          value={mockData.startedDexSwap}
          icon={Users}
          trend={12.5}
          description="Users who initiated swap"
          onClick={() => handleKPIClick("startedDexSwap")}
          clickable
        />
        <KPICard
          title="Connected Wallet"
          value={mockData.connectedCereWallet}
          icon={Wallet}
          trend={-5.2}
          description="Users who connected wallet"
          onClick={() => handleKPIClick("connectedCereWallet")}
          clickable
        />
        <KPICard
          title="Completed Trade"
          value={mockData.completedTrade}
          icon={CheckCircle}
          trend={8.1}
          description="Users who finished trade"
          onClick={() => handleKPIClick("completedTrade")}
          clickable
        />
        <KPICard
          title="Start → Connect"
          value={`${startedToConnected}%`}
          icon={TrendingUp}
          trend={2.3}
          description="Conversion rate"
          isPercentage
        />
        <KPICard
          title="Start → Complete"
          value={`${startedToCompleted}%`}
          icon={TrendingUp}
          trend={-1.8}
          description="Overall conversion"
          isPercentage
        />
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Campaign Funnel</CardTitle>
            <CardDescription>User progression through funnel stages</CardDescription>
          </CardHeader>
          <CardContent>
            <FunnelChart data={mockData} onStageClick={handleFunnelStageClick} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>7-Day Trend</CardTitle>
            <CardDescription>Historical performance over time</CardDescription>
          </CardHeader>
          <CardContent>
            <TrendChart data={historicalData} />
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderContent = () => {
    // If we're in a specific user detail view, show that
    if (selectedView === "user-detail" && selectedUser) {
      return <UserActivityDetail user={selectedUser} onBack={() => setSelectedView("dashboard")} />
    }

    // If we're in users list view from funnel, show that
    if (selectedView === "users") {
      return (
        <UsersList
          stage={selectedFunnelStage}
          onBack={() => setSelectedView("dashboard")}
          onUserSelect={(user) => {
            setSelectedUser(user)
            setSelectedView("user-detail")
          }}
        />
      )
    }

    // Otherwise, show content based on activeView (sidebar navigation)
    switch (activeView) {
      case "overview":
        return renderEnhancedOverview()
      case "funnel":
        return renderFunnelView()
      case "users":
        return (
          <UsersList
            stage={null}
            onBack={() => setActiveView("overview")}
            onUserSelect={(user) => {
              setSelectedUser(user)
              setSelectedView("user-detail")
            }}
          />
        )
      default:
        return renderEnhancedOverview()
    }
  }

  const handleViewChange = (view: string) => {
    setActiveView(view)
    setSelectedView("dashboard") // Reset to dashboard view when changing navigation
    setSelectedFunnelStage(null) // Clear any funnel stage selection
    setSelectedUser(null) // Clear any selected user
    setSidebarOpen(false) // Close mobile sidebar
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <AppSidebar activeView={activeView} onViewChange={handleViewChange} />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <AppSidebar activeView={activeView} onViewChange={handleViewChange} />
        </SheetContent>
      </Sheet>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-16 items-center gap-4 px-4 sm:px-6">
            <div className="flex flex-1 items-center justify-between min-w-0">
              <div className="flex items-center gap-3 min-w-0">
                {/* Mobile menu button */}
                <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open sidebar</span>
                </Button>

                <div className="min-w-0">
                  <h1 className="text-lg font-semibold truncate">
                    {navigationItems.find((item) => item.id === activeView)?.title || "Overview"}
                  </h1>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Mobile-optimized controls */}
                <div className="hidden sm:block">
                  <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Campaign" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="58">Campaign #58</SelectItem>
                      <SelectItem value="57">Campaign #57</SelectItem>
                      <SelectItem value="56">Campaign #56</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="hidden md:block">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-[200px] justify-start text-left font-normal bg-transparent"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange?.from ? (
                          dateRange.to ? (
                            <>
                              {format(dateRange.from, "MMM dd")} - {format(dateRange.to, "MMM dd")}
                            </>
                          ) : (
                            format(dateRange.from, "MMM dd, y")
                          )
                        ) : (
                          <span>Date range</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={dateRange?.from}
                        selected={dateRange}
                        onSelect={(range) => {
                          if (range?.from && range?.to) {
                            setDateRange({ from: range.from, to: range.to })
                          }
                        }}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <ThemeToggle />
                <Button onClick={refreshData} disabled={isLoading} size="sm">
                  <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                  <span className="hidden sm:inline">Refresh</span>
                </Button>
              </div>
            </div>
          </div>

          <div className="px-4 sm:px-6 pb-4 border-t border-border/40">
            <Badge
              variant={
                freshnessStatus.color === "success"
                  ? "default"
                  : freshnessStatus.color === "warning"
                    ? "secondary"
                    : "destructive"
              }
              className="mt-3"
            >
              Last updated: {format(lastUpdated, "MMM dd, HH:mm")}
            </Badge>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6">{renderContent()}</div>
        </main>
      </div>
    </div>
  )
}
