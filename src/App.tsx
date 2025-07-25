import React, { useEffect, useState } from "react";
import { subDays } from "date-fns";

import { Sheet, SheetContent } from "./components/ui/sheet";

import { AppHeader } from "./components/layout/AppHeader";
import { AppSidebar } from "./components/layout/AppSidebar";
import { OverviewView } from "./components/views/OverviewView";
import { FunnelView } from "./components/views/FunnelView";
import { UsersView } from "./components/views/UsersView";
import { UserActivityDetail } from "./components/user-activity-detail";
import { FullPageLoader } from "./components/ui/loader.tsx";
import { api, type FunnelData, type ICommunity, type User, type Organization, type Campaign } from "./lib/api.ts";
import { useAuth } from "./contexts/AuthContext.tsx";

export default function CommunityIntelligenceDashboard() {
  const [selectedOrganization, setSelectedOrganization] =
    useState<string>("2115");
  const [selectedCampaign, setSelectedCampaign] = useState("58");
  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 7),
    to: new Date(),
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoadingOrganizations, setIsLoadingOrganizations] = useState(true);
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(false);

  const [selectedView, setSelectedView] = useState<
    "dashboard" | "users" | "user-detail"
  >("dashboard");
  const [, setSelectedFunnelStage] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [activeView, setActiveView] = useState("overview");

  const [funnelData, setFunnelData] = React.useState<FunnelData>();
  const [communityData, setCommunityData] = React.useState<ICommunity>();
  const [users, setUsers] = useState<User[]>([]);

  const { token } = useAuth();

  useEffect(() => {
    const loadOrganizations = async () => {
      if (!token) return;

      setIsLoadingOrganizations(true);
      try {
        const orgs = await api.getOrganizations(token);
        setOrganizations(orgs);

        if (orgs.length > 0 && !selectedOrganization) {
          setSelectedOrganization(orgs[0].id);
        }
      } catch (error) {
        console.error("Failed to load organizations:", error);
      } finally {
        setIsLoadingOrganizations(false);
      }
    };

    loadOrganizations();
  }, [token]);

  useEffect(() => {
    const loadCampaigns = async () => {
      if (!token || !selectedOrganization) return;

      setIsLoadingCampaigns(true);
      try {
        const camps = await api.getCampaigns(selectedOrganization, token);
        setCampaigns(camps);

        if (camps.length > 0 && !selectedCampaign) {
          setSelectedCampaign(camps[0].campaignId.toString());
        }
      } catch (error) {
        console.error("Failed to load campaigns:", error);
      } finally {
        setIsLoadingCampaigns(false);
      }
    };

    loadCampaigns();
  }, [selectedOrganization, token]);

  React.useEffect(() => {
    if (!selectedCampaign) return;

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
      } catch (error) {
        console.error("Failed to load overview data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [dateRange.from, dateRange.to, selectedCampaign]);

  useEffect(() => {
    if (!selectedCampaign || !selectedOrganization) return;

    const loadData = async () => {
      setIsLoading(true);
      try {
        const response = await api.getUsers({
          campaignId: selectedCampaign,
          organizationId: selectedOrganization,
          dateFrom: dateRange.from.toISOString(),
          dateTo: dateRange.to.toISOString(),
        });
        setUsers(response);
      } catch (error) {
        console.error("Failed to load users data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [dateRange.from, dateRange.to, selectedCampaign, selectedOrganization]);

  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      const [funnel, community, usersData] = await Promise.all([
        api.getFunnelData({
          campaignId: selectedCampaign,
          dateFrom: dateRange.from.toISOString(),
          dateTo: dateRange.to.toISOString(),
        }),
        api.getCommunityData(),
        api.getUsers({
          campaignId: selectedCampaign,
          organizationId: selectedOrganization,
          dateFrom: dateRange.from.toISOString(),
          dateTo: dateRange.to.toISOString(),
        }),
      ]);

      setFunnelData(funnel);
      setCommunityData(community);
      setUsers(usersData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to refresh data:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const isInitialDataLoaded = !isLoadingOrganizations && organizations.length > 0 &&
                              (!isLoadingCampaigns || campaigns.length > 0);

  if (!isInitialDataLoaded) {
    return (
      <FullPageLoader
        text={isLoadingOrganizations ? "Loading organizations..." : "Loading campaigns..."}
      />
    );
  }

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

    // Otherwise, show content based on activeView (sidebar navigation)
    switch (activeView) {
      case "overview":
        return (
          <OverviewView
            activeUsersCount={users.length || 0}
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
            users={users}
            selectedCampaign={selectedCampaign}
            isLoading={isLoading}
          />
        );
      default:
        return (
          <OverviewView
            activeUsersCount={users.length || 0}
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
          activeUsersCount={users.length || 0}
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
            activeUsersCount={users.length || 0}
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
          isLoading={isLoading || isRefreshing}
          onRefresh={refreshData}
          lastUpdated={lastUpdated}
          onSidebarToggle={() => setSidebarOpen(true)}
          activeView={activeView}
          organizations={organizations}
          campaigns={campaigns}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6">{renderContent()}</div>
        </main>
      </div>
    </div>
  );
}
