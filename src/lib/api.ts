import { logger, getApiUrl, env } from "./env";
import apiClient from "../services/apiClient.ts";

// API Types
export interface FunnelData {
  summary: {
    startedDexSwap: number;
    connectedCereWallet: number;
    completedTrade: number;
    executedAt: string;
  };
  trends: {
    completedTrade: Array<{ date: string; value: number }>;
    connectedCereWallet: Array<{ date: string; value: number }>;
    startedDexSwap: Array<{ date: string; value: number }>;
  };
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

export interface User {
  id: string;
  username: string;
  user: string;
  completed_at: string;
  points: number;
  quests_completed: number;
  last_activity: string;
}

export type QuizPayload = {
  answers: {
    quiz_id: string;
    question_id: string;
    answer_id: string;
  }[];
};

export type VideoPayload = {
  video_id: string;
  video_length: number;
  segment_length: string;
  segments_watched: number[];
  last_watched_segment: number;
};

export type CustomPayload = {
  questId: string;
  subtype: string;
  startEvent: string;
  completedEvent: string;
  // Additional fields for DEX swaps
  swapDetails?: {
    from: string;
    to: string;
    value: string;
    fromAmount: string;
    toAmount: string;
    tokenFrom: string;
    tokenTo: string;
  };
  // Additional fields for social connections
  socialPlatform?: string;
  socialUsername?: string;
};

export type QuestPayload = QuizPayload | VideoPayload | CustomPayload;

export type QuestActivity = {
  account_id: string;
  organization_id: string | number;
  campaign_id: string | number;
  quest_type: string;
  points: number;
  started_at: string;
  completed_at: string | null;
  payload: QuestPayload;
};

export type QuestActivitiesMap = Record<string, QuestActivity>;

type GetUserActivitiesResponse = {
  result: {
    code: "SUCCESS" | string;
    data: {
      success: boolean;
      data: QuestActivitiesMap;
      emittedEvents: unknown[];
    };
  };
  metadata: {
    operation: {
      id: string;
      name: string;
    };
    raft: {
      id: string;
      name: string;
    };
    executedAt: string;
  };
};

// API Functions
export const api = {
  async getOrganizations(token?: string): Promise<Organization[]> {
    try {
      const response = await apiClient.get(
        `/data-services/${env.DATA_SERVICE_ID}/organizations`,
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
    // dateFrom,
    // dateTo,
  }: {
    campaignId: string;
    organizationId: string;
    dateFrom: string;
    dateTo: string;
  }): Promise<User[]> {
    try {
      const response = await fetch(
        `${env.RULE_SERVICE_API_URL}/data-service/${env.DATA_SERVICE_ID}/query/get_leaderboard_for_funnel`,
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
        `${env.RULE_SERVICE_API_URL}/data-service/${env.DATA_SERVICE_ID}/query/campaign_funnel`,
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
        summary: {
          startedDexSwap: 0,
          completedTrade: 0,
          connectedCereWallet: 0,
          executedAt: new Date().toISOString(),
        },
        trends: {
          completedTrade: [],
          connectedCereWallet: [],
          startedDexSwap: [],
        },
      };
    }
  },

  // Community Data
  async getCommunityData(): Promise<ICommunity> {
    logger.debug("Fetching community data");

    try {
      const response = await fetch(
        "https://ai-rule.stage.cere.io/rule/data-service/2599/query/nlp2_last_context", // @TODO replace
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

  // User Activity
  async getUserActivity({
    userId,
    campaignId,
  }: {
    userId: string;
    campaignId: string;
  }): Promise<QuestActivitiesMap> {
    logger.debug("Fetching user activity", { userId });

    try {
      const response = await fetch(
        `${env.RULE_SERVICE_API_URL}/data-service/${env.DATA_SERVICE_ID}/query/get_user_activities`,
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

      const data: GetUserActivitiesResponse = await response.json();
      logger.debug("User activity fetched successfully", data);
      return data.result.data.data;
    } catch (error) {
      logger.error("Error fetching user activity:", error);
      return {};
    }
  },

  // Refresh Data
  async refreshData(): Promise<{ success: boolean; timestamp: string }> {
    logger.debug("Refreshing data");

    try {
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
