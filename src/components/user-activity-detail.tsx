import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Avatar, AvatarFallback } from "./ui/avatar";
import {
  ArrowLeft,
  DollarSign,
  Star,
  CheckCircle,
  Play,
  Wallet,
  MessageSquare,
  BarChart3,
  TrendingUp,
} from "lucide-react";
import { api, type QuestActivitiesMap, type CustomPayload } from "../lib/api";
import { Loader } from "./ui/loader";

interface UserActivityDetailProps {
  user: {
    user: string;
    username?: string;
  };
  campaignId: string;
  onBack: () => void;
  onViewTelegramActivity?: (user: { user: string; username?: string }) => void;
}

export function UserActivityDetail({
  user,
  campaignId,
  onBack,
  onViewTelegramActivity,
}: UserActivityDetailProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [activities, setActivities] = useState<QuestActivitiesMap>({});

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      setIsLoading(true);
      try {
        const response = await api.getUserActivity({
          campaignId,
          userId: user.user,
        });
        setActivities(response);
      } catch (error) {
        console.error("Failed to load user activities:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [campaignId, user]);

  const activityList = useMemo(
    () =>
      Object.values(activities).sort(
        (a, b) =>
          new Date(b.started_at).getTime() - new Date(a.started_at).getTime(),
      ),
    [activities],
  );

  const { completedCount, totalCount, completionRate } = useMemo(() => {
    const total = activityList.length;
    const completed = activityList.filter((a) => !!a.completed_at).length;
    return {
      totalCount: total,
      completedCount: completed,
      completionRate: total === 0 ? 0 : (completed / total) * 100,
    };
  }, [activityList]);

  const preferredQuests = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const a of activityList) {
      counts[a.quest_type] = (counts[a.quest_type] || 0) + 1;
    }
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return {
      top: sorted[0]?.[0] ?? "—",
      listText: sorted.map(([type, cnt]) => `${type} (${cnt})`).join(", "),
    };
  }, [activityList]);

  // Calculate amount traded from DEX activities
  const amountTraded = useMemo(() => {
    let total = 0;
    for (const activity of activityList) {
      if (activity.quest_type === "custom" && "subtype" in activity.payload) {
        const payload = activity.payload as CustomPayload;
        if (payload.subtype === "dex") {
          total += 0;
        }
      }
    }
    return total;
  }, [activityList]);

  const getActivityIcon = (type: string, subtype?: string) => {
    if (type === "custom" && subtype === "x_connect") {
      return <MessageSquare className="h-4 w-4" />;
    }
    if (type === "custom" && subtype === "dex") {
      return <TrendingUp className="h-4 w-4" />;
    }
    if (type === "custom" && subtype === "wallet") {
      return <Wallet className="h-4 w-4" />;
    }
    if (type === "video") {
      return <Play className="h-4 w-4" />;
    }
    if (type === "quiz") {
      return <BarChart3 className="h-4 w-4" />;
    }
    return <CheckCircle className="h-4 w-4" />;
  };

  const getActivityColor = (type: string, subtype?: string) => {
    if (
      type === "custom" &&
      (subtype === "x_connect" || subtype === "dex" || subtype === "wallet")
    ) {
      return "bg-green-500";
    }
    if (type === "video") {
      return "bg-purple-500";
    }
    if (type === "quiz") {
      return "bg-blue-500";
    }
    return "bg-gray-500";
  };

  const getStatusColor = (completed: boolean) =>
    completed
      ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";

  const formatAccountId = (accountId: string) =>
    `${accountId?.slice(0, 8)}...${accountId?.slice(-8)}`;

  const formatDate = (iso: string | null) => {
    if (!iso) return "—";
    const date = new Date(iso);
    return (
      date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }) +
      " at " +
      date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
    );
  };

  const formatTime = (iso: string | null) => {
    if (!iso) return "—";
    const date = new Date(iso);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const diffMs = (from: string, to: string | null) =>
    to ? new Date(to).getTime() - new Date(from).getTime() : 0;

  const formatDuration = (ms: number) => {
    if (!ms || ms < 0) return "0";
    const sec = Math.floor(ms / 1000);
    const m = Math.floor(sec / 60);
    const h = Math.floor(m / 60);
    const s = sec % 60;

    if (h > 0) {
      return `${h}h`;
    } else if (m > 0) {
      return `${m}m`;
    } else {
      return `${s}s`;
    }
  };

  const getActivityTitle = (activity: any) => {
    if (activity.quest_type === "custom") {
      const payload = activity.payload as CustomPayload;
      if (payload.subtype === "x_connect") return "Social Connect";
      if (payload.subtype === "dex") return "DEX Trading";
      if (payload.subtype === "wallet") return "Wallet Connection";
      return "Custom Quest";
    }
    if (activity.quest_type === "video") return "Video Learning";
    if (activity.quest_type === "quiz") return "Knowledge Quiz";
    return activity.quest_type;
  };

  const getSwapDetails = (activity: any) => {
    if (activity.quest_type === "custom") {
      const payload = activity.payload as CustomPayload;
      if (payload.subtype === "dex") {
        return {
          // from: "1.25 ETH",
          // to: "2450.75 PAPPLE",
          // value: "$2,450",
          // fromAmount: "1.25",
          // toAmount: "2450.75",
          tokenFrom: "ETH",
          tokenTo: "PAPPLE",
        };
      }
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">User Activity</h1>
          <div className="flex items-center gap-2 mt-1">
            <div className="bg-red-500 text-white text-xs px-2 py-1 rounded">
              Last updated: Jul 22, 13:45
            </div>
          </div>
        </div>

        {/* Telegram Activity Button */}
        {onViewTelegramActivity && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewTelegramActivity(user)}
            className="border-purple-300 text-purple-700 hover:bg-purple-50"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Telegram Activity
          </Button>
        )}
      </div>

      {/* Back Button and User Info */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Users
        </Button>

        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary/10 text-primary">
              {user?.username?.slice(0, 2).toUpperCase() || "MA"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-lg font-semibold">
              {user?.username || "mazhutoanton"}
            </h2>
            <p className="text-sm text-muted-foreground font-mono">
              {formatAccountId(
                user?.user ||
                  "6R44Eo6brL3YMMtFuocjgdCN9REzpHHWCGS5AVh49btFN13J",
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700 dark:text-green-300">
                  Amount Traded
                </p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  ${amountTraded.toLocaleString()}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  Following DEX swaps
                </p>
              </div>
              <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700 dark:text-orange-300">
                  Preferred Quests
                </p>
                <p className="text-sm font-semibold text-orange-900 dark:text-orange-100">
                  {preferredQuests.top}
                </p>
                <p className="text-xs text-orange-600 dark:text-orange-400">
                  {preferredQuests.listText || "—"}
                </p>
              </div>
              <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <Star className="h-4 w-4 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  Completion Rate
                </p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {completionRate.toFixed(1)}%
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  {completedCount}/{totalCount} completed
                </p>
                <div className="mt-2">
                  <Progress value={completionRate} className="h-2" />
                </div>
              </div>
              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Timeline</CardTitle>
          <CardDescription>
            Detailed quest completion journey with interactive elements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              <Loader />
            ) : activityList.length === 0 ? (
              <p className="text-sm text-muted-foreground">No activities</p>
            ) : (
              activityList.map((activity, index) => {
                const completed = !!activity.completed_at;
                const duration = formatDuration(
                  diffMs(activity.started_at, activity.completed_at),
                );

                const isVideo = activity.quest_type === "video";
                const isQuiz = activity.quest_type === "quiz";
                const isCustom = activity.quest_type === "custom";
                const payload = activity.payload as any;
                const subtype = isCustom ? payload.subtype : null;

                const title = getActivityTitle(activity);
                const swapDetails = getSwapDetails(activity);

                return (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50"
                  >
                    {/* Activity Icon */}
                    <div
                      className={`w-8 h-8 ${getActivityColor(
                        activity.quest_type,
                        subtype,
                      )} rounded-full flex items-center justify-center text-white flex-shrink-0`}
                    >
                      {getActivityIcon(activity.quest_type, subtype)}
                    </div>

                    {/* Activity Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium">{title}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(activity.started_at)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(completed)}>
                            {completed ? "Completed" : "In Progress"}
                          </Badge>
                          <span className="text-sm font-medium text-green-600">
                            +{activity.points} points
                          </span>
                        </div>
                      </div>

                      {/* Time Details */}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-2">
                        <span>Started: {formatTime(activity.started_at)}</span>
                        {completed && (
                          <>
                            <span>
                              Completed: {formatTime(activity.completed_at)}
                            </span>
                            <span>({duration})</span>
                          </>
                        )}
                      </div>

                      {/* Activity Specific Details */}
                      {isCustom && payload && (
                        <div className="text-sm text-muted-foreground mb-1">
                          {payload.subtype === "x_connect" && (
                            <p>X_connect Quest</p>
                          )}
                          {payload.subtype === "dex" && <p>Dex Quest</p>}
                          {payload.subtype === "wallet" && <p>Wallet Quest</p>}
                          {payload.startEvent && payload.completedEvent && (
                            <p>
                              {payload.startEvent} → {payload.completedEvent}
                            </p>
                          )}
                          {swapDetails && (
                            <div>
                              <p>{`From: ${swapDetails.tokenFrom} to ${swapDetails.tokenTo}`}</p>
                              {/*<p>From: {swapDetails.fromAmount} {swapDetails.tokenFrom} to {swapDetails.toAmount} {swapDetails.tokenTo}</p>*/}
                              {/*<p className="text-green-600 font-medium">Total: {swapDetails.value}</p>*/}
                            </div>
                          )}
                        </div>
                      )}

                      {isVideo && payload && (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                              {payload.segments_watched?.length || 0}/
                              {Math.ceil(
                                (payload.video_length || 0) /
                                  parseFloat(payload.segment_length || "1"),
                              )}{" "}
                              segments
                            </span>
                            <span className="text-muted-foreground">
                              {Math.round(payload.video_length || 0)}s • Last
                              segment: {payload.last_watched_segment || 0}
                            </span>
                          </div>
                          <Progress
                            value={
                              ((payload.segments_watched?.length || 0) /
                                Math.max(
                                  1,
                                  Math.ceil(
                                    (payload.video_length || 0) /
                                      parseFloat(payload.segment_length || "1"),
                                  ),
                                )) *
                              100
                            }
                            className="h-2"
                          />
                        </div>
                      )}

                      {isQuiz && payload && (
                        <div className="text-sm text-muted-foreground">
                          <p className="mb-1">
                            {payload.answers?.length || 0} Questions Answered
                          </p>
                          {payload.answers
                            ?.slice(0, 3)
                            .map((_answer: any, qIndex: number) => (
                              <p key={qIndex} className="text-xs">
                                Question {qIndex + 1} completed
                              </p>
                            ))}
                          {payload.answers?.length > 3 && (
                            <p className="text-xs">
                              +{payload.answers.length - 3} more questions
                            </p>
                          )}
                        </div>
                      )}

                      <p className="text-xs text-muted-foreground mt-1">
                        ID:{" "}
                        {payload?.questId ||
                          payload?.video_id?.split("/")[4] ||
                          payload?.answers?.[0]?.quiz_id ||
                          activity.account_id}
                      </p>
                    </div>

                    {/*/!* View Details Link *!/*/}
                    {/*<Button variant="ghost" size="sm" className="flex items-center gap-1 text-blue-600 hover:text-blue-700">*/}
                    {/*  <ExternalLink className="h-3 w-3" />*/}
                    {/*  View Details*/}
                    {/*</Button>*/}
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
