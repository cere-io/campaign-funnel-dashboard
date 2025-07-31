import { useState } from "react";
import { Users, Trophy, Target } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { FunnelChart } from "../funnel-chart";
import { TrendChart } from "../trend-chart";
import { StageUsersModal } from "../stage-users-modal";
import { type FunnelData, type ICommunity, type User } from "../../lib/api";
import { Loader } from "../ui/loader.tsx";

interface OverviewViewProps {
  selectedCampaign: string;
  dateRange: { from: Date; to: Date };
  isLoading: boolean;
  communityData?: ICommunity;
  funnelData?: FunnelData;
  activeUsersCount: number;
  users: User[];
  allUsers: User[]; // All users for cumulative chart
  onViewTelegramActivity?: (user: User) => void;
}

export function OverviewView({
  activeUsersCount,
  funnelData,
  isLoading,
  selectedCampaign,
  dateRange,
  users,
  allUsers,
  onViewTelegramActivity,
}: OverviewViewProps) {
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    stage: string;
  }>({
    isOpen: false,
    stage: "",
  });

  if (isLoading) {
    return <Loader />;
  }

  const handleFunnelStageClick = (stage: string, count: number) => {
    console.log("Funnel stage clicked:", stage, count);
    setModalState({
      isOpen: true,
      stage,
    });
  };

  const handleModalClose = () => {
    setModalState({
      isOpen: false,
      stage: "",
    });
  };

  // Calculate metrics from user data (same logic as StageUsersModal)
  const getUsersForStage = (stage: string) => {
    if (!users) return []

    switch (stage) {
      case "started":
        // Users Who Started DEX Swap - users with DEX task (regardless of completion)
        return users.filter(user => {
          const dexTask = user.quests?.customTasks?.find((task: any) => task.subtype === "dex")
          return !!dexTask // Has DEX task, regardless of completion status
        })
      case "connected":
        // Users who connected wallet (have external_wallet_address)
        return users.filter(user => user.external_wallet_address)
      case "completed":
        // Users Who Completed Trade - users with completed DEX task
        return users.filter(user => {
          const dexTask = user.quests?.customTasks?.find((task: any) => task.subtype === "dex")
          return dexTask?.completed === true // Specifically completed DEX swap
        })
      default:
        return users
    }
  }

  const startedDexUsers = getUsersForStage("started")
  const connectedWalletUsers = getUsersForStage("connected")
  const completedTradeUsers = getUsersForStage("completed")

  console.log("📊 REAL DATA ANALYTICS")
  console.log(`Selected period: ${dateRange.from.toLocaleDateString()} - ${dateRange.to.toLocaleDateString()}`)
  console.log("Filtered users (for tables):", users.length)
  console.log("All users (for chart):", allUsers.length)
  console.log("Started DEX users:", startedDexUsers.length)
  console.log("Completed trade users:", completedTradeUsers.length)

  // Calculate trends data based on REAL quest completion dates and selected dateRange
  // Use allUsers for proper cumulative chart (not filtered by dateRange)
  const calculateTrendsFromUsers = () => {
    if (!allUsers || allUsers.length === 0) {
      console.log("⚠️ No allUsers data available for chart");
      return {
        completedTrade: [],
        connectedCereWallet: [],
        startedDexSwap: [],
      }
    }

    // Use the selected date range from date picker
    const startDate = dateRange.from.toISOString().split('T')[0]
    const endDate = dateRange.to.toISOString().split('T')[0]

    console.log("📅 Using SELECTED date range for trends:", {
      startDate,
      endDate,
      fromPicker: dateRange.from.toLocaleDateString(),
      toPicker: dateRange.to.toLocaleDateString()
    })

    // Generate all dates in the SELECTED range
    const allDates = []
    const currentDate = new Date(startDate)
    const finalDate = new Date(endDate)

    while (currentDate <= finalDate) {
      allDates.push(currentDate.toISOString().split('T')[0])
      currentDate.setDate(currentDate.getDate() + 1)
    }

    // Calculate cumulative data for each date using ALL users (not filtered by dateRange)
    const trends = allDates.map(currentDate => {

      // CUMULATIVE LOGIC: Count ALL users who were active UP TO this date (regardless of startDate)
      const usersActiveByDate = allUsers.filter(user => {
        // Use last_activity for determining when user was active
        if (!user.last_activity) return false
        const userActivityDate = new Date(user.last_activity).toISOString().split('T')[0]
        return userActivityDate <= currentDate  // ✅ Only filter by currentDate, not startDate
      })

      // Count users who STARTED DEX (have DEX task and were active by this date)
      const startedCount = usersActiveByDate.filter(user => {
        const dexTask = user.quests?.customTasks?.find((task: any) => task.subtype === "dex")
        return !!dexTask
      }).length

      // Count users who CONNECTED wallet (have wallet address and were active by this date)
      const connectedCount = usersActiveByDate.filter(user =>
        user.external_wallet_address
      ).length

      // Count users who COMPLETED DEX (have completed DEX task and were active by this date)
      // Use completed_at date if available, otherwise use last_activity
      const completedCount = allUsers.filter(user => {
        const dexTask = user.quests?.customTasks?.find((task: any) => task.subtype === "dex")
        if (!dexTask?.completed) return false

        // Use completed_at if available, otherwise fall back to last_activity
        const completionDate = user.completed_at || user.last_activity
        if (!completionDate) return false

        const userCompletionDate = new Date(completionDate).toISOString().split('T')[0]
        return userCompletionDate <= currentDate  // ✅ Only filter by currentDate, not startDate
      }).length

      return {
        date: currentDate,
        started: startedCount,
        connected: connectedCount,
        completed: completedCount
      }
    })

    console.log("📊 Calculated CUMULATIVE trends for selected period:", {
      dateRange: `${startDate} to ${endDate}`,
      totalDays: trends.length,
      finalValues: {
        started: trends[trends.length - 1]?.started || 0,
        connected: trends[trends.length - 1]?.connected || 0,
        completed: trends[trends.length - 1]?.completed || 0,
      }
    })

    // Convert to API format
    const result = {
      startedDexSwap: trends.map(({ date, started }) => ({ date, value: started })),
      connectedCereWallet: trends.map(({ date, connected }) => ({ date, value: connected })),
      completedTrade: trends.map(({ date, completed }) => ({ date, value: completed }))
    }

    console.log("✅ Using CUMULATIVE logic with ALL users (no date filtering)")
    console.log("Display period:", `${dateRange.from.toLocaleDateString()} - ${dateRange.to.toLocaleDateString()}`)
    console.log("All users available for chart:", allUsers.length)
    console.log("Filtered users for tables:", users.length)

    return result
  }

  // Create funnel data based on user data (synchronized with modal)
  const userBasedFunnelData = {
    summary: {
      startedDexSwap: startedDexUsers.length,
      connectedCereWallet: connectedWalletUsers.length,
      completedTrade: completedTradeUsers.length,
      executedAt: new Date().toISOString(),
    },
    trends: calculateTrendsFromUsers()
  }

  const campaignMetrics = {
    totalUsers: activeUsersCount || 0,
    completedTrades: completedTradeUsers.length,
    conversionRate: startedDexUsers.length && completedTradeUsers.length
        ? ((completedTradeUsers.length / startedDexUsers.length) * 100).toFixed(1)
        : "0.0",
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Campaign Overview
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Real-time analytics and insights
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Users
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {campaignMetrics.totalUsers.toLocaleString()}
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Completed Trades
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {campaignMetrics.completedTrades.toLocaleString()}
                </p>
              </div>
              <Trophy className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Conversion Rate
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {campaignMetrics.conversionRate}%
                </p>
              </div>
              <Target className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      {funnelData && (
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Funnel</CardTitle>
              <CardDescription>User progression through stages</CardDescription>
            </CardHeader>
            <CardContent>
              <FunnelChart
                data={userBasedFunnelData.summary}
                onStageClick={handleFunnelStageClick}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
              <CardDescription>Historical performance data</CardDescription>
            </CardHeader>
            <CardContent>
              <TrendChart data={userBasedFunnelData.trends} />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Stage Users Modal */}
      <StageUsersModal
        users={users}
        isOpen={modalState.isOpen}
        onClose={handleModalClose}
        stage={modalState.stage}
        campaignId={selectedCampaign}
        onViewTelegramActivity={onViewTelegramActivity}
      />
    </div>
  );
}
