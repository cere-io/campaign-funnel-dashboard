import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { FunnelChart } from "../funnel-chart";
import { TrendChart } from "../trend-chart";
import { KPICard } from "../kpi-card";
import { type FunnelData, type HistoricalData } from "../../lib/api";
import { TrendingUp, Users, Wallet, CheckCircle } from "lucide-react";
import { format, subDays } from "date-fns";
import { Loader } from "../ui/loader.tsx";
import {useState} from "react";

interface FunnelViewProps {
  selectedCampaign: string;
  dateRange: { from: Date; to: Date };
  isLoading: boolean;
  funnelData?: FunnelData;
}

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

export function FunnelView({
  funnelData,
  isLoading,
}: FunnelViewProps) {
  const [historicalData,] = useState<HistoricalData[]>(
    generateHistoricalData(),
  );

  if (isLoading) {
    return <Loader />;
  }

  const dataForDisplay = funnelData;

  // Calculate conversion rates
  const startedToConnected = dataForDisplay
    ? (
        (dataForDisplay.connectedCereWallet / dataForDisplay.startedDexSwap) *
        100
      ).toFixed(1)
    : 0;
  const startedToCompleted = dataForDisplay
    ? (
        (dataForDisplay.completedTrade / dataForDisplay.startedDexSwap) *
        100
      ).toFixed(1)
    : 0;

  const handleKPIClick = (stage: string) => {
    console.log("KPI clicked:", stage);
  };

  const handleFunnelStageClick = (stage: string, count: number) => {
    console.log("Funnel stage clicked:", stage, count);
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <KPICard
          title="Started DEX Swap"
          value={dataForDisplay?.startedDexSwap || 0}
          icon={Users}
          trend={12.5}
          description="Users who initiated swap"
          onClick={() => handleKPIClick("startedDexSwap")}
          clickable
        />
        <KPICard
          title="Connected Wallet"
          value={dataForDisplay?.connectedCereWallet || 0}
          icon={Wallet}
          trend={-5.2}
          description="Users who connected wallet"
          onClick={() => handleKPIClick("connectedCereWallet")}
          clickable
        />
        <KPICard
          title="Completed Trade"
          value={dataForDisplay?.completedTrade || 0}
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
            <CardDescription>
              User progression through funnel stages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FunnelChart
              data={dataForDisplay}
              onStageClick={handleFunnelStageClick}
            />
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
  );
}
