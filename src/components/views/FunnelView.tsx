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
import { type FunnelData } from "../../lib/api";
import { TrendingUp, Users, Wallet, CheckCircle } from "lucide-react";
import { Loader } from "../ui/loader.tsx";
import { env } from "../../lib/env.ts";

interface FunnelViewProps {
  selectedCampaign: string;
  dateRange: { from: Date; to: Date };
  isLoading: boolean;
  funnelData?: FunnelData;
}

const generateHistoricalData = (trends?: FunnelData["trends"]) => {
  if (!trends) return [];
  const result: {
    date: string;
    startedDexSwap: number;
    connectedCereWallet: number;
    completedTrade: number;
  }[] = [];

  const allDatesSet = new Set<string>();
  Object.values(trends).forEach((arr) =>
    arr.forEach((entry) => allDatesSet.add(entry.date)),
  );

  const allDates = Array.from(allDatesSet).sort(); // Сортируем по дате

  for (const date of allDates) {
    const entry = {
      date,
      startedDexSwap:
        trends.startedDexSwap.find((d) => d.date === date)?.value ?? 0,
      connectedCereWallet:
        trends.connectedCereWallet.find((d) => d.date === date)?.value ?? 0,
      completedTrade:
        trends.completedTrade.find((d) => d.date === date)?.value ?? 0,
    };

    result.push(entry);
  }

  return result;
};

export function FunnelView({ funnelData, isLoading }: FunnelViewProps) {
  if (isLoading) {
    return <Loader />;
  }

  const dataForDisplay = funnelData;

  // Calculate conversion rates
  const startedToConnected = dataForDisplay
    ? (
        (dataForDisplay?.summary.connectedCereWallet /
          dataForDisplay?.summary?.startedDexSwap) *
        100
      ).toFixed(1)
    : 0;
  const startedToCompleted = dataForDisplay
    ? (
        (dataForDisplay?.summary?.completedTrade /
          dataForDisplay?.summary?.startedDexSwap) *
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
      <div
          className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-${
              env.HIDE_CONNECT_WALLET_METRICS ? 4 : 5
          }`}
      >
        <KPICard
          title="Started DEX Swap"
          value={dataForDisplay?.summary?.startedDexSwap || 0}
          icon={Users}
          trend={12.5}
          description="Users who initiated swap"
          onClick={() => handleKPIClick("startedDexSwap")}
          clickable
        />
        {!env.HIDE_CONNECT_WALLET_METRICS && (
          <KPICard
            title="Connected Wallet"
            value={dataForDisplay?.summary?.connectedCereWallet || 0}
            icon={Wallet}
            trend={-5.2}
            description="Users who connected wallet"
            onClick={() => handleKPIClick("connectedCereWallet")}
            clickable
          />
        )}
        <KPICard
          title="Completed Trade"
          value={dataForDisplay?.summary?.completedTrade || 0}
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
              data={dataForDisplay?.summary}
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
            <TrendChart data={generateHistoricalData(dataForDisplay?.trends)} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
