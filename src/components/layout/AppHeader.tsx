import { CalendarIcon, RefreshCw, Menu } from "lucide-react";
import { format } from "date-fns";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Badge } from "../ui/badge";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { ThemeToggle } from "./ThemeToggle";
import { useEffect, useState } from "react";
import {api, type Campaign, type Organization} from "../../lib/api.ts";
import {useAuth} from "../../contexts/AuthContext.tsx";

interface AppHeaderProps {
  selectedOrganization?: string;
  setSelectedOrganization: (selectedOrganization: string) => void;
  selectedCampaign: string;
  setSelectedCampaign: (campaign: string) => void;
  dateRange: { from: Date; to: Date };
  setDateRange: (range: { from: Date; to: Date }) => void;
  isLoading: boolean;
  onRefresh: () => void;
  lastUpdated: Date;
  onSidebarToggle: () => void;
  activeView: string;
}

const navigationItems = [
  { title: "Overview", id: "overview" },
  { title: "Campaign Funnel", id: "funnel" },
  { title: "User Activity", id: "user-activity" },
];

export function AppHeader({
  selectedOrganization,
  setSelectedOrganization,
  selectedCampaign,
  setSelectedCampaign,
  dateRange,
  setDateRange,
  isLoading,
  onRefresh,
  lastUpdated,
  onSidebarToggle,
  activeView,
}: AppHeaderProps) {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  const {connect, walletStatus, token} = useAuth()

  console.log({ walletStatus });
  useEffect(() => {
    if (!token) return
    const loadData = async () => {
      const orgs = await api.getOrganizations(token);
      setOrganizations(orgs);
    };

    loadData();
  }, [token]);

  useEffect(() => {
    if (!token) return
    const loadData = async () => {
      if (!token && !selectedOrganization) return
      const camps = await api.getCampaigns(selectedOrganization!,token);
      setCampaigns(camps)
    }
    loadData();
  }, [selectedOrganization, token]);

  // Check data freshness
  const getDataFreshnessStatus = () => {
    const now = new Date();
    const diffMinutes = (now.getTime() - lastUpdated.getTime()) / (1000 * 60);

    if (diffMinutes > 120) return { status: "stale", color: "destructive" };
    if (diffMinutes > 30) return { status: "warning", color: "warning" };
    return { status: "fresh", color: "success" };
  };

  const freshnessStatus = getDataFreshnessStatus();

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center gap-4 px-4 sm:px-6">
        <div className="flex flex-1 items-center justify-between min-w-0">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={onSidebarToggle}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open sidebar</span>
            </Button>

            <div className="min-w-0">
              <h1 className="text-lg font-semibold truncate">
                {navigationItems.find((item) => item.id === activeView)
                  ?.title || "Overview"}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Mobile-optimized controls */}
            <div className="hidden sm:block">
              <Select
                value={selectedOrganization}
                onValueChange={setSelectedOrganization}
              >
                <SelectTrigger className="w-[170px]">
                  <SelectValue placeholder="Organization" />
                </SelectTrigger>
                <SelectContent>
                  {organizations.map((organization) => (
                      <SelectItem key={organization.id} value={organization.id}>{`${organization.name} #${organization.id}`}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="hidden sm:block">
              <Select
                value={selectedCampaign}
                onValueChange={setSelectedCampaign}
              >
                <SelectTrigger className="w-[170px]">
                  <SelectValue placeholder="Campaign" />
                </SelectTrigger>
                <SelectContent>
                  {campaigns.map((campaign) => (
                  <SelectItem value={campaign.campaignId.toString()}>{`Campaign ${campaign.campaignName}`}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="hidden md:block">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-[200px] justify-start text-left font-normal bg-transparent"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "MMM dd")} -{" "}
                          {format(dateRange.to, "MMM dd")}
                        </>
                      ) : (
                        format(dateRange.from, "MMM dd, y")
                      )
                    ) : (
                      <span>Date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={(range) => {
                      if (range?.from && range?.to) {
                        setDateRange({ from: range.from, to: range.to });
                      }
                    }}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <ThemeToggle />
            <Button onClick={onRefresh} disabled={isLoading} size="sm">
              <RefreshCw
                className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            {walletStatus !== 'connected' && <Button onClick={() => connect({email: undefined})}>
              Connect
            </Button>}
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 pb-4 border-t border-border/40">
        <Badge
          variant={
            freshnessStatus.color === "success"
              ? "default"
              : freshnessStatus.color === "warning"
                ? "secondary"
                : "destructive"
          }
          className="mt-3"
        >
          Last updated: {format(lastUpdated, "MMM dd, HH:mm")}
        </Badge>
      </div>
    </header>
  );
}
