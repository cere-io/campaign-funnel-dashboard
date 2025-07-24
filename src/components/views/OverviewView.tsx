import {
  TrendingUp,
  Users,
  CheckCircle,
  MessageSquare,
  Heart,
  Activity,
  Hash,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { FunnelChart } from "../funnel-chart";
import { type FunnelData, type ICommunity } from "../../lib/api";
import { Loader } from "../ui/loader.tsx";

interface OverviewViewProps {
  selectedCampaign: string;
  dateRange: { from: Date; to: Date };
  isLoading: boolean;
  communityData?: ICommunity;
  funnelData?: FunnelData;
}

export function OverviewView({
  communityData,
  funnelData,
  isLoading,
}: OverviewViewProps) {
  if (isLoading) {
    return <Loader />;
  }

  // Calculate community metrics
  const communityDataForDisplay = communityData;
  const sentimentScore = (
    ((communityDataForDisplay?.sentimentAnalysis?.positive || 0) /
      ((communityDataForDisplay?.sentimentAnalysis?.positive || 0) +
        (communityDataForDisplay?.sentimentAnalysis?.negative || 0))) *
    100
  ).toFixed(1);

  const activeUsers = new Set(
    (communityDataForDisplay?.messages || []).map((msg) => msg.fromUserName),
  );

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
              {funnelData?.completedTrade}
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
              {activeUsers.size}
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
              {communityDataForDisplay?.messages.length || 0}
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
              data={funnelData}
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
                      strokeDasharray={`${(communityDataForDisplay?.sentimentAnalysis?.averageSentiment  || 0) * 100}, 100`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-xl sm:text-2xl font-bold text-green-600">
                        {(communityDataForDisplay?.sentimentAnalysis?.averageSentiment  || 0) * 100}%
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
                  {communityDataForDisplay?.sentimentAnalysis?.positive || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-400 rounded-full" />
                  <span className="text-sm">Neutral</span>
                </div>
                <span className="text-sm font-medium">
                  {communityDataForDisplay?.sentimentAnalysis?.neutral || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full" />
                  <span className="text-sm">Negative</span>
                </div>
                <span className="text-sm font-medium">
                  {communityDataForDisplay?.sentimentAnalysis?.negative || 0}
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
              {communityDataForDisplay?.messages
                ?.slice(0, 4)
                .map((message, index: number) => (
                  <div
                    key={message.topic + index}
                    className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div
                      className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                        Number(message.sentiment) >= 0.5
                          ? "bg-green-500"
                          : Number(message.sentiment) <= 0.5
                            ? "bg-red-500"
                            : "bg-gray-400"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                        <span className="text-sm font-medium">
                          {message.fromUserName}
                        </span>
                        <Badge
                          variant="outline"
                          className="text-xs w-fit whitespace-nowrap"
                        >
                          {message.topic}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {message.content}
                      </p>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2">
                        <span className="text-xs text-muted-foreground">
                          Confidence:{" "}
                          {/*{(activity.topic_confidence * 100).toFixed(0)}%*/}
                          TODO
                        </span>
                        {(communityDataForDisplay.topics.find(
                          (topic) => topic.name === message.topic,
                        )?.is_new ||
                          false) && (
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
              {(communityDataForDisplay?.topics || []).map(
                (topic, index: number) => (
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
                        {/*{topic.message_count} msgs*/}
                        topic.message_count TODO
                      </Badge>
                    </div>
                  </div>
                ),
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
