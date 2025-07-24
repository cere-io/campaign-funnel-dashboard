import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { FunnelChart } from "../funnel-chart"
import { api, type FunnelData } from "../../lib/api"

interface FunnelViewProps {
  selectedCampaign: string
  dateRange: { from: Date; to: Date }
  isLoading: boolean
}

export function FunnelView({ selectedCampaign, dateRange, isLoading }: FunnelViewProps) {
  const [funnelData, setFunnelData] = React.useState<FunnelData | null>(null)

  React.useEffect(() => {
    const loadData = async () => {
      try {
        const data = await api.getFunnelData()
        setFunnelData(data)
      } catch (error) {
        console.error("Failed to load funnel data:", error)
      }
    }

    loadData()
  }, [selectedCampaign])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading funnel data...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Campaign Funnel Analysis</CardTitle>
          <CardDescription>
            Detailed breakdown of user progression through the campaign funnel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FunnelChart data={funnelData || { startedDexSwap: 0, connectedCereWallet: 0, completedTrade: 0 }} />
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Started DEX Swap</CardTitle>
            <CardDescription>Initial engagement</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{funnelData?.startedDexSwap || 0}</div>
            <p className="text-sm text-muted-foreground mt-2">
              Users who initiated the DEX swap process
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Connected Cere Wallet</CardTitle>
            <CardDescription>Wallet connection step</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{funnelData?.connectedCereWallet || 0}</div>
            <p className="text-sm text-muted-foreground mt-2">
              Users who successfully connected their Cere wallet
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Completed Trade</CardTitle>
            <CardDescription>Final conversion</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{funnelData?.completedTrade || 0}</div>
            <p className="text-sm text-muted-foreground mt-2">
              Users who completed the entire trade process
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Conversion Rates</CardTitle>
          <CardDescription>Step-by-step conversion analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Started to Connected</span>
              <span className="text-sm text-muted-foreground">
                {funnelData
                  ? `${((funnelData.connectedCereWallet / funnelData.startedDexSwap) * 100).toFixed(1)}%`
                  : "0%"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Connected to Completed</span>
              <span className="text-sm text-muted-foreground">
                {funnelData
                  ? `${((funnelData.completedTrade / funnelData.connectedCereWallet) * 100).toFixed(1)}%`
                  : "0%"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Conversion</span>
              <span className="text-sm text-muted-foreground">
                {funnelData
                  ? `${((funnelData.completedTrade / funnelData.startedDexSwap) * 100).toFixed(1)}%`
                  : "0%"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 