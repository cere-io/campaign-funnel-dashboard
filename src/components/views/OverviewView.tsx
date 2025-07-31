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
}

export function OverviewView({
  activeUsersCount,
  funnelData,
  isLoading,
  selectedCampaign,
  users,
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

  // Calculate trends data based on user activity dates
  const calculateTrendsFromUsers = () => {
    if (!users || users.length === 0) {
      return {
        completedTrade: [],
        connectedCereWallet: [],
        startedDexSwap: [],
      }
    }

    // Get all unique dates from user activities and sort them
    const allDates = users
      .filter(user => user.last_activity)
      .map(user => new Date(user.last_activity!).toISOString().split('T')[0])
      .filter((date, index, self) => self.indexOf(date) === index)
      .sort()

    // Calculate cumulative data for each date
    const trends = allDates.map(currentDate => {
      // Count users who had activity up to this date
      const usersUpToDate = users.filter(user => {
        if (!user.last_activity) return false
        const userDate = new Date(user.last_activity).toISOString().split('T')[0]
        return userDate <= currentDate
      })

      // Count users in each stage up to this date
      const startedCount = usersUpToDate.filter(user => {
        const dexTask = user.quests?.customTasks?.find((task: any) => task.subtype === "dex")
        return !!dexTask
      }).length

      const connectedCount = usersUpToDate.filter(user => 
        user.external_wallet_address
      ).length

      const completedCount = usersUpToDate.filter(user => {
        const dexTask = user.quests?.customTasks?.find((task: any) => task.subtype === "dex")
        return dexTask?.completed === true
      }).length

      return {
        date: currentDate,
        started: startedCount,
        connected: connectedCount,
        completed: completedCount
      }
    })

    // Convert to API format
    const result = {
      startedDexSwap: trends.map(({ date, started }) => ({ date, value: started })),
      connectedCereWallet: trends.map(({ date, connected }) => ({ date, value: connected })),
      completedTrade: trends.map(({ date, completed }) => ({ date, value: completed }))
    }

    console.log("Calculated trends data:", result)
    console.log("All dates found:", allDates)
    console.log("Users with last_activity:", users.filter(u => u.last_activity).length)
    
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
      />
    </div>
  );
}
