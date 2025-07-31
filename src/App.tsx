import React, { useEffect, useState, useRef } from "react";
import { subDays } from "date-fns";

import { Button } from "./components/ui/button";
import { RefreshCw, Home, Activity, Brain } from "lucide-react";
import { ThemeToggle } from "./components/layout/ThemeToggle";
import { DatePickerWithRange } from "./components/date-range-picker";

import { OverviewView } from "./components/views/OverviewView";

import { UsersView } from "./components/views/UsersView";
import { AIAnalysisView } from "./components/views/AIAnalysisView";
import { UserActivityDetail } from "./components/user-activity-detail";
import { FullPageLoader } from "./components/ui/loader.tsx";
import {
  api,
  type FunnelData,
  type ICommunity,
  type User,
  type Organization,
  type Campaign,
} from "./lib/api.ts";
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

  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignsLoaded, setCampaignsLoaded] = useState(false);
  const [isLoadingOrganizations, setIsLoadingOrganizations] = useState(false);

  const [selectedView, setSelectedView] = useState<
    "dashboard" | "users" | "user-detail"
  >("dashboard");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [activeView, setActiveView] = useState("overview");

  // Track if this is the first render to avoid resetting on initial load
  const isFirstRender = useRef(true);
  const previousOrganization = useRef<string | null>(null);

  const [funnelData, setFunnelData] = React.useState<FunnelData>();
  const [communityData, setCommunityData] = React.useState<ICommunity>();
  const [users, setUsers] = useState<User[]>([]);

  const { token, isAuthenticated, walletStatus, connect } = useAuth();

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
    console.log("🔍 App.tsx - loadCampaigns useEffect triggered:", {
      token: !!token,
      selectedOrganization,
      previousOrg: previousOrganization.current
    });

    const loadCampaigns = async () => {
      if (!token || !selectedOrganization) {
        console.log("🚫 App.tsx - Skipping campaign load: missing token or organization");
        return;
      }

            const isFirstLoad = previousOrganization.current === null;
      const organizationChanged = previousOrganization.current !== null && previousOrganization.current !== selectedOrganization;
      
      console.log("🔍 App.tsx - Organization change check:", {
        isFirstLoad,
        organizationChanged,
        previous: previousOrganization.current,
        current: selectedOrganization
      });
      
      previousOrganization.current = selectedOrganization;

      // Reset campaigns loaded state when organization changes
      if (organizationChanged) {
        console.log("🔄 App.tsx - Organization changed, resetting campaigns loaded state");
        setCampaignsLoaded(false);
      }

      try {
        const camps = await api.getCampaigns(selectedOrganization, token);
        setCampaigns(camps);
        setCampaignsLoaded(true);

                // Set campaign when organization changes or no campaign is selected
        if (camps.length > 0) {
          console.log("🔍 App.tsx - Campaign selection logic:", {
            isFirstLoad,
            organizationChanged,
            selectedCampaign,
            hasSelectedCampaign: !!selectedCampaign,
            previousOrg: previousOrganization.current,
            currentOrg: selectedOrganization,
            availableCampaigns: camps.map(c => c.campaignId.toString())
          });
          
          // Check if selected campaign exists in the available campaigns
          const isCampaignAvailable = camps.some(camp => 
            camp.campaignId.toString() === selectedCampaign
          );
          
          if (organizationChanged || !selectedCampaign || (selectedCampaign && !isCampaignAvailable)) {
            const newCampaignId = camps[0].campaignId.toString();
            let reason = "";
            if (organizationChanged) reason = "organization changed";
            else if (!selectedCampaign) reason = "no campaign selected";
            else if (!isCampaignAvailable) reason = "current campaign not available in new organization";
            
            console.log(`🔄 App.tsx - Setting campaign due to ${reason}:`, newCampaignId, "previous campaign:", selectedCampaign);
            setSelectedCampaign(newCampaignId);
          } else if (isFirstLoad && selectedCampaign && isCampaignAvailable) {
            console.log("✅ App.tsx - First load: keeping user's campaign:", selectedCampaign);
          } else {
            console.log("✅ App.tsx - Keeping current campaign:", selectedCampaign);
          }
        } else {
          // Clear campaign if no campaigns available
          console.log("🚫 App.tsx - No campaigns available, clearing campaign");
          setSelectedCampaign("");
        }
      } catch (error) {
        console.error("Failed to load campaigns:", error);
        setCampaignsLoaded(false);
      }
    };

    loadCampaigns();
  }, [selectedOrganization, token]);

  // Clear data when user disconnects
  useEffect(() => {
    if (!isAuthenticated) {
      setOrganizations([]);
      setCampaigns([]);
      setCampaignsLoaded(false);
      setFunnelData(undefined);
      setCommunityData(undefined);
      setUsers([]);
      setIsLoadingOrganizations(false);
    }
  }, [isAuthenticated]);

  // Reset view when campaign or organization changes
  React.useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      console.log("🔍 App.tsx - First render, skipping view reset");
      return;
    }

    console.log("🔄 App.tsx - Resetting view due to campaign/organization change:", {
      selectedCampaign,
      selectedOrganization,
      currentView: selectedView
    });
    setSelectedView("dashboard");
    setSelectedUser(null);
  }, [selectedCampaign, selectedOrganization]);

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
    if (!selectedCampaign || !selectedOrganization || !campaignsLoaded) return;

    // Check if selected campaign belongs to the selected organization
    const isCampaignValid = campaigns.some(camp =>
      camp.campaignId.toString() === selectedCampaign
    );

    if (!isCampaignValid) {
      console.log("🚫 App.tsx - Campaign", selectedCampaign, "doesn't belong to organization", selectedOrganization, "campaigns loaded:", campaignsLoaded);
      return;
    }

    console.log("✅ App.tsx - Loading users with campaign:", selectedCampaign, "organization:", selectedOrganization, "campaigns loaded:", campaignsLoaded);

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
  }, [dateRange.from, dateRange.to, selectedCampaign, selectedOrganization, campaignsLoaded]);

  const refreshData = async () => {
    console.log("🔄 App.tsx - Manual refresh triggered with campaign:", selectedCampaign, "organization:", selectedOrganization);

    if (!campaignsLoaded) {
      console.log("🚫 App.tsx - Cannot refresh: Campaigns not loaded yet");
      return;
    }

    // Check if selected campaign belongs to the selected organization
    const isCampaignValid = campaigns.some(camp =>
      camp.campaignId.toString() === selectedCampaign
    );

    if (!isCampaignValid) {
      console.log("🚫 App.tsx - Cannot refresh: Campaign", selectedCampaign, "doesn't belong to organization", selectedOrganization);
      return;
    }

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
    } catch (error) {
      console.error("Failed to refresh data:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSelectUser = (user: User | null) => {
    setSelectedUser(user)
  }

  // Show loader only if authenticated and still loading organizations
  const shouldShowLoader = isAuthenticated && isLoadingOrganizations;

  if (shouldShowLoader) {
    return <FullPageLoader text="Loading organizations..." />;
  }

  const renderContent = () => {
    // If not authenticated, show connect wallet message
    if (!isAuthenticated) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {walletStatus === "disconnected"
                ? "Wallet Disconnected"
                : "Connect Wallet to Continue"}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Please connect your wallet to access the dashboard.
            </p>
          </div>
        </div>
      );
    }

    // If authenticated but no organizations loaded yet, show message
    if (
      isAuthenticated &&
      organizations.length === 0 &&
      !isLoadingOrganizations
    ) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              No Organizations Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              No organizations are available for your account.
            </p>
          </div>
        </div>
      );
    }

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

    // Show based on activeView (tab navigation)
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
            users={users}
          />
        );

      case "user-activity":
        return (
          <UsersView
            users={users}
            user={selectedUser}
            onSelect={handleSelectUser}
            isLoading={isLoading}
            campaignId={selectedCampaign}
          />
        );
      case "ai-analysis":
        return <AIAnalysisView isAuthenticated={isAuthenticated} />;
      default:
        return (
          <OverviewView
            users={users}
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Title */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
                  <span className="hidden sm:inline">
                    Community Intelligence
                  </span>
                  <span className="sm:hidden">Dashboard</span>
                </h1>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-4">
              {isAuthenticated && (
                <>
                  <div className="hidden md:flex items-center space-x-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Org:
                    </label>
                    <select
                      value={selectedOrganization}
                      onChange={(e) => setSelectedOrganization(e.target.value)}
                      className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      {organizations.map((org) => (
                        <option key={org.id} value={org.id}>
                          {org.name} #{org.id}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="hidden md:flex items-center space-x-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Campaign:
                    </label>
                    <select
                      value={selectedCampaign}
                      onChange={(e) => setSelectedCampaign(e.target.value)}
                      className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      {campaigns.map((campaign) => (
                        <option
                          key={campaign.campaignId}
                          value={campaign.campaignId.toString()}
                        >
                          Campaign {campaign.campaignName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="hidden lg:block">
                    <DatePickerWithRange
                      date={dateRange}
                      onDateChange={(date) =>
                        date &&
                        date.from &&
                        date.to &&
                        setDateRange({ from: date.from, to: date.to })
                      }
                    />
                  </div>

                  <Button
                    onClick={refreshData}
                    disabled={isLoading || isRefreshing}
                    size="sm"
                    variant="outline"
                  >
                    {isLoading || isRefreshing ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                  </Button>
                </>
              )}

              <ThemeToggle />

              {walletStatus !== "connected" && (
                <Button
                  onClick={() => connect({ email: undefined })}
                  disabled={walletStatus === "initializing"}
                  size="sm"
                >
                  {walletStatus === "initializing"
                    ? "Connecting..."
                    : "Connect Wallet"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      {isAuthenticated && (
        <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-4 md:space-x-8 overflow-x-auto">
              <button
                onClick={() => setActiveView("overview")}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeView === "overview"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:border-gray-300"
                }`}
              >
                <Home className="w-4 h-4 inline mr-2" />
                <span className="hidden sm:inline">Dashboard</span>
                <span className="sm:hidden">Home</span>
              </button>

              <button
                onClick={() => setActiveView("user-activity")}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeView === "user-activity"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:border-gray-300"
                }`}
              >
                <Activity className="w-4 h-4 inline mr-2" />
                <span className="hidden sm:inline">Campaigns</span>
                <span className="sm:hidden">Users</span>
              </button>
              <button
                onClick={() => setActiveView("ai-analysis")}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeView === "ai-analysis"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:border-gray-300"
                }`}
              >
                <Brain className="w-4 h-4 inline mr-2" />
                <span className="hidden sm:inline">AI NLP insights</span>
                <span className="sm:hidden">AI</span>
              </button>
            </div>
          </div>
        </nav>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>
    </div>
  );
}
