import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { FunnelChart } from "../funnel-chart"
import { TrendChart } from "../trend-chart"
import { KPICard } from "../kpi-card"
import { CommunityIntelligence } from "../community-intelligence"
import { api, type FunnelData, type CommunityData, type HistoricalData } from "../../lib/api"
import { TrendingUp, Users, Wallet, Target } from "lucide-react"

interface OverviewViewProps {
  selectedCampaign: string
  dateRange: { from: Date; to: Date }
  isLoading: boolean
}

export function OverviewView({ selectedCampaign, dateRange, isLoading }: OverviewViewProps) {
  const [funnelData, setFunnelData] = React.useState<FunnelData | null>(null)
  const [communityData, setCommunityData] = React.useState<CommunityData | null>(null)
  const [historicalData, setHistoricalData] = React.useState<HistoricalData[]>([])

  React.useEffect(() => {
    const loadData = async () => {
      try {
        const [funnel, community, historical] = await Promise.all([
          api.getFunnelData(),
          api.getCommunityData(),
          api.getHistoricalData(7),
        ])
        setFunnelData(funnel)
        setCommunityData(community)
        setHistoricalData(historical)
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

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Started DEX Swap"
          value={funnelData?.startedDexSwap || 0}
          icon={TrendingUp}
          trend={12.5}
          description="Users who started DEX swap"
        />
        <KPICard
          title="Connected Cere Wallet"
          value={funnelData?.connectedCereWallet || 0}
          icon={Wallet}
          trend={8.2}
          description="Users who connected wallet"
        />
        <KPICard
          title="Completed Trade"
          value={funnelData?.completedTrade || 0}
          icon={Target}
          trend={15.3}
          description="Users who completed trade"
        />
        <KPICard
          title="Conversion Rate"
          value={`${funnelData ? ((funnelData.completedTrade / funnelData.startedDexSwap) * 100).toFixed(1) : 0}%`}
          icon={Users}
          trend={2.1}
          description="Overall conversion rate"
          isPercentage
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Campaign Funnel</CardTitle>
            <CardDescription>User progression through the campaign</CardDescription>
          </CardHeader>
          <CardContent>
            <FunnelChart data={funnelData || { startedDexSwap: 0, connectedCereWallet: 0, completedTrade: 0 }} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Trend Analysis</CardTitle>
            <CardDescription>Performance over time</CardDescription>
          </CardHeader>
          <CardContent>
            <TrendChart data={historicalData} />
          </CardContent>
        </Card>
      </div>

      {/* Community Intelligence */}
      <Card>
        <CardHeader>
          <CardTitle>Community Intelligence</CardTitle>
          <CardDescription>Real-time community sentiment and activity</CardDescription>
        </CardHeader>
        <CardContent>
          <CommunityIntelligence data={communityData} />
        </CardContent>
      </Card>
    </div>
  )
} 