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

  // Calculate metrics from funnel data
  const campaignMetrics = {
    totalUsers: activeUsersCount || 0,
    completedTrades: funnelData?.summary?.completedTrade || 0,
    conversionRate: funnelData?.summary?.startedDexSwap
      ? (
          (funnelData.summary.completedTrade /
            funnelData.summary.startedDexSwap) *
          100
        ).toFixed(1)
      : "0.0",
  };

  console.log({ funnelData });
  console.log("Trends data:", funnelData?.trends);

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
                data={funnelData?.summary}
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
              <TrendChart data={funnelData?.trends} />
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
