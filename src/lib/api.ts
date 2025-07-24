import { env, logger, getApiUrl } from "./env";
import apiClient from "../services/apiClient.ts";

// API Types
export interface FunnelData {
  startedDexSwap: number;
  connectedCereWallet: number;
  completedTrade: number;
  executedAt: string;
}

export interface Organization {
  id: string;
  name: string;
  dataServiceId: string;
  archived: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Campaign {
  campaignId: number;
  status: number;
  startDate: Date;
  campaignRules: string;
  endDate: Date;
  campaignName: string | null;
  type: number | null;
  likeId: string | null;
  archive: number;
  mobile: number | null;
  userName: string | null;
  modDate: Date | null;
  guid: string | null;
  formData: string | null;
  campaignApps: ICampaignApp[];
}

export interface ICampaignApp {
  id: number;
  name: string;
  campaignId: number;
}

export interface ICommunity {
  sentimentAnalysis: {
    averageSentiment: number;
    dominantSentiment: string;
    negative: number;
    positive: number;
    neutral?: number;
    total: number;
  };
  topics: Array<{
    id: number;
    name: string;
    keywords: string[];
    is_new: boolean;
    message_count: number;
  }>;
  messages: Array<{
    content: string;
    fromUserName: string;
    sentiment: string;
    topic: string;
  }>;
}

export interface CommunityData {
  result: {
    code: string;
    data: ICommunity;
  };
}

export interface HistoricalData {
  date: string;
  startedDexSwap: number;
  connectedCereWallet: number;
  completedTrade: number;
}

export interface User {
  id: string;
  username: string;
  user: string;
  completed_at: string;
  points: number;
  quests_completed: number;
  last_activity: string;
}

// API Functions
export const api = {
  async getOrganizations(token?: string): Promise<Organization[]> {
    try {
      const response = await apiClient.get(
        "/data-services/2105/organizations",
        {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        },
      );
      return response.data.data;
    } catch (error) {
      logger.error("Error fetching organizations data:", error);
      return [];
    }
  },

  async getCampaigns(
    organizationId: string,
    token?: string,
  ): Promise<Campaign[]> {
    try {
      const response = await apiClient.get("/campaign", {
        params: {
          organizationId,
        },
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      return response.data.data;
    } catch (error) {
      logger.error("Error fetching organizations data:", error);
      return [];
    }
  },

  async getUsers({
    organizationId,
    campaignId,
    dateFrom,
    dateTo,
  }: {
    campaignId: string;
    organizationId: string;
    dateFrom: string;
    dateTo: string;
  }): Promise<User[]> {
    try {
      const response = await fetch(
        "https://ai-rule.cere.io/rule/data-service/2105/query/get_leaderboard",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            params: {
              campaign_id: campaignId,
              organization_id: organizationId,
              // date_from: dateFrom,
              // date_to: dateTo,
              account_id: "6R44Eo6brL3YMMtFuocjgdCN9REzpHHWCGS5AVh49btFN13J",
            },
          }),
        },
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.result.data.data.users;
    } catch (error) {
      logger.error("Error fetching users data:", error);
      return [];
    }
  },
  // Funnel Data
  async getFunnelData({
    campaignId,
    dateFrom,
    dateTo,
  }: {
    campaignId: string;
    dateFrom: string;
    dateTo: string;
  }): Promise<FunnelData> {
    logger.debug("Fetching funnel data");

    try {
      const response = await fetch(
        "https://ai-rule.cere.io/rule/data-service/2105/query/campaign_funnel",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            params: {
              campaign_id: campaignId,
              from: dateFrom,
              to: dateTo,
            },
          }),
        },
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      logger.debug("Funnel data fetched successfully", data);
      return data.result.data.data.data;
    } catch (error) {
      logger.error("Error fetching funnel data:", error);
      return {
        startedDexSwap: 0,
        completedTrade: 0,
        connectedCereWallet: 0,
        executedAt: new Date().toISOString(),
      };
    }
  },

  // Community Data
  async getCommunityData(): Promise<ICommunity> {
    logger.debug("Fetching community data");

    try {
      const response = await fetch(
        "https://ai-rule.stage.cere.io/rule/data-service/2599/query/nlp2_last_context",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            params: {
              channelId: 2148778849,
            },
          }),
        },
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      logger.debug("Community data fetched successfully", data);
      return data.result.data.data;
    } catch (error) {
      logger.error("Error fetching community data:", error);
      return {
        sentimentAnalysis: {
          averageSentiment: 0,
          dominantSentiment: "positive",
          positive: 0,
          negative: 0,
          neutral: 0,
          total: 0,
        },
        messages: [],
        topics: [],
      };
    }
  },

  // Historical Data
  async getHistoricalData(days: number = 7): Promise<HistoricalData[]> {
    logger.debug(`Fetching historical data for ${days} days`);

    try {
      if (env.ENVIRONMENT === "development") {
        await new Promise((resolve) => setTimeout(resolve, 200));

        const data: HistoricalData[] = [];
        for (let i = days - 1; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);

          data.push({
            date: date.toISOString().split("T")[0],
            startedDexSwap: Math.floor(Math.random() * 30) + 40,
            connectedCereWallet: Math.floor(Math.random() * 8) + 6,
            completedTrade: Math.floor(Math.random() * 4) + 3,
          });
        }

        logger.debug("Using mock historical data");
        return data;
      }

      const response = await fetch(getApiUrl(`historical?days=${days}`));
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      logger.debug("Historical data fetched successfully", data);
      return data;
    } catch (error) {
      logger.error("Error fetching historical data:", error);
      // Return empty array as fallback
      return [];
    }
  },

  // User Activity
  async getUserActivity({
    userId,
    campaignId,
  }: {
    userId: string;
    campaignId: string;
  }): Promise<any> {
    logger.debug("Fetching user activity", { userId });

    try {
      const response = await fetch(
        `https://ai-rule.cere.io/rule/data-service/2105/query/get_user_activities`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            params: {
              account_id: userId,
              campaign_id: campaignId,
            },
          }),
        },
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      logger.debug("User activity fetched successfully", data);
      return data.result.data.data;
    } catch (error) {
      logger.error("Error fetching user activity:", error);
      return null;
    }
  },

  // Refresh Data
  async refreshData(): Promise<{ success: boolean; timestamp: string }> {
    logger.debug("Refreshing data");

    try {
      if (env.ENVIRONMENT === "development") {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        logger.debug("Mock data refresh completed");
        return {
          success: true,
          timestamp: new Date().toISOString(),
        };
      }

      const response = await fetch(getApiUrl("refresh"), { method: "POST" });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      logger.debug("Data refresh completed successfully", data);
      return data;
    } catch (error) {
      logger.error("Error refreshing data:", error);
      return {
        success: false,
        timestamp: new Date().toISOString(),
      };
    }
  },
};
