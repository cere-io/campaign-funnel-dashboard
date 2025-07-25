import React, { useState } from "react";
import { subDays } from "date-fns";

import { Sheet, SheetContent } from "./components/ui/sheet";

import { AppHeader } from "./components/layout/AppHeader";
import { AppSidebar } from "./components/layout/AppSidebar";
import { OverviewView } from "./components/views/OverviewView";
import { FunnelView } from "./components/views/FunnelView";
import { UsersView } from "./components/views/UsersView";
import { UserActivityDetail } from "./components/user-activity-detail";
import { api, type FunnelData, type ICommunity } from "./lib/api.ts";

export default function CommunityIntelligenceDashboard() {
  const [selectedOrganization, setSelectedOrganization] =
    useState<string>("2115");
  const [selectedCampaign, setSelectedCampaign] = useState("58");
  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 7),
    to: new Date(),
  });
  const [isRefresing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [selectedView, setSelectedView] = useState<
    "dashboard" | "users" | "user-detail"
  >("dashboard");
  const [, setSelectedFunnelStage] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [activeView, setActiveView] = useState("overview");

  const [funnelData, setFunnelData] = React.useState<FunnelData>();
  const [communityData, setCommunityData] = React.useState<ICommunity>();

  React.useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [funnel, community] = await Promise.all([
          api.getFunnelData({
            campaignId: selectedCampaign,
            dateFrom: dateRange.from.toISOString(),
            dateTo: dateRange.to.toISOString(),
          }),
          api.getCommunityData(),
        ]);
        setFunnelData(funnel);
        setCommunityData(community);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to load overview data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [dateRange.from, dateRange.to, selectedCampaign]);

  const refreshData = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLastUpdated(new Date());
    setIsRefreshing(false);
  };

  // const handleKPIClick = (stage: string) => {
  //   setSelectedFunnelStage(stage);
  //   setSelectedView("users");
  // };

  // const handleFunnelStageClick = (stage: string, count: number) => {
  //   // Map funnel stage names to the same format used by KPI cards
  //   let mappedStage = stage;
  //   if (stage === "Started DEX Swap") mappedStage = "startedDexSwap";
  //   if (stage === "Connected Wallet") mappedStage = "connectedCereWallet";
  //   if (stage === "Completed Trade") mappedStage = "completedTrade";
  //
  //   setSelectedFunnelStage(mappedStage);
  //   setSelectedView("users");
  // };

  const renderContent = () => {
    // If we're in a specific user detail view, show that
    if (selectedView === "user-detail" && selectedUser) {
      return (
        <UserActivityDetail
          campaignId={selectedCampaign}
          user={selectedUser}
          onBack={() => setSelectedView("dashboard")}
        />
      );
    }
    // // If we're in users list view from funnel, show that
    // if (selectedView === "users") {
    //   return (
    //     <UsersList
    //       stage={selectedFunnelStage}
    //       onBack={() => setSelectedView("dashboard")}
    //       onUserSelect={(user) => {
    //         setSelectedUser(user);
    //         setSelectedView("user-detail");
    //       }}
    //     />
    //   );
    // }

    // Otherwise, show content based on activeView (sidebar navigation)
    switch (activeView) {
      case "overview":
        return (
          <OverviewView
            funnelData={funnelData}
            communityData={communityData}
            selectedCampaign={selectedCampaign}
            dateRange={dateRange}
            isLoading={isLoading}
          />
        );
      case "funnel":
        return (
          <FunnelView
            funnelData={funnelData}
            selectedCampaign={selectedCampaign}
            dateRange={dateRange}
            isLoading={isLoading}
          />
        );
      case "user-activity":
        return (
          <UsersView
            selectedOrganization={selectedOrganization}
            selectedCampaign={selectedCampaign}
            dateRange={dateRange}
            isLoading={isLoading}
          />
        );
      default:
        return (
          <OverviewView
            communityData={communityData}
            funnelData={funnelData}
            selectedCampaign={selectedCampaign}
            dateRange={dateRange}
            isLoading={isLoading}
          />
        );
    }
  };

  const handleViewChange = (view: string) => {
    setActiveView(view);
    setSelectedView("dashboard"); // Reset to dashboard view when changing navigation
    setSelectedFunnelStage(null); // Clear any funnel stage selection
    setSelectedUser(null); // Clear any selected user
    setSidebarOpen(false); // Close mobile sidebar
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <AppSidebar
          communityData={communityData}
          funnelData={funnelData}
          activeView={activeView}
          onViewChange={handleViewChange}
        />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <AppSidebar
            communityData={communityData}
            funnelData={funnelData}
            activeView={activeView}
            onViewChange={handleViewChange}
          />
        </SheetContent>
      </Sheet>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <AppHeader
          selectedOrganization={selectedOrganization}
          setSelectedOrganization={setSelectedOrganization}
          selectedCampaign={selectedCampaign}
          setSelectedCampaign={setSelectedCampaign}
          dateRange={dateRange}
          setDateRange={setDateRange}
          isLoading={isLoading || isRefresing}
          onRefresh={refreshData}
          lastUpdated={lastUpdated}
          onSidebarToggle={() => setSidebarOpen(true)}
          activeView={activeView}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6">{renderContent()}</div>
        </main>
      </div>
    </div>
  );
}
