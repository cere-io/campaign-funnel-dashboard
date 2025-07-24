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

export interface CommunityData {
  result: {
    code: string;
    data: {
      processing_summary: {
        timestamp: string;
        total_messages: number;
        total_topics: number;
        new_topics_created: number;
        existing_topics_used: number;
        total_users: number;
      };
      users_summary: Array<{
        user_id: number;
        username: string;
        messages_in_batch: number;
        messages_assigned: number;
      }>;
      sentiment_analysis: {
        positive_messages: number;
        negative_messages: number;
        neutral_messages: number;
        average_sentiment_confidence: number;
        sentiment_by_user: Array<{
          user_id: number;
          username: string;
          positive_count: number;
          negative_count: number;
          neutral_count: number;
          average_confidence: number;
        }>;
      };
      topics: Array<{
        id: number;
        name: string;
        keywords: string[];
        is_new: boolean;
        message_count: number;
      }>;
      assignments_summary: Array<{
        message_id: number;
        topic_id: number;
        topic_name: string;
        topic_confidence: number;
        is_new_topic: boolean;
        message_preview: string;
        user: {
          id: number;
          username: string;
        };
        sentiment: string;
      }>;
    };
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
  account_id: string;
  completed_at: string;
  total_points: number;
  quests_completed: number;
  last_activity: string;
}

// Mock Data
const mockFunnelData: FunnelData = {
  startedDexSwap: 64,
  connectedCereWallet: 10,
  completedTrade: 5,
  executedAt: "2025-07-22T10:45:57.024Z",
};

const mockCommunityData: CommunityData = {
  result: {
    code: "SUCCESS",
    data: {
      processing_summary: {
        timestamp: "2025-07-22T19:57:24.708Z",
        total_messages: 5,
        total_topics: 18,
        new_topics_created: 2,
        existing_topics_used: 16,
        total_users: 5,
      },
      users_summary: [
        {
          user_id: 105,
          username: "frustrated_user",
          messages_in_batch: 1,
          messages_assigned: 1,
        },
        {
          user_id: 104,
          username: "react_dev",
          messages_in_batch: 1,
          messages_assigned: 1,
        },
        {
          user_id: 103,
          username: "ai_researcher",
          messages_in_batch: 1,
          messages_assigned: 1,
        },
        {
          user_id: 102,
          username: "sports_fan",
          messages_in_batch: 1,
          messages_assigned: 1,
        },
        {
          user_id: 101,
          username: "webdev_enthusiast",
          messages_in_batch: 1,
          messages_assigned: 1,
        },
      ],
      sentiment_analysis: {
        positive_messages: 4,
        negative_messages: 1,
        neutral_messages: 0,
        average_sentiment_confidence: 0.6795238095238095,
        sentiment_by_user: [
          {
            user_id: 105,
            username: "frustrated_user",
            positive_count: 0,
            negative_count: 1,
            neutral_count: 0,
            average_confidence: 0.8333333333333333,
          },
          {
            user_id: 104,
            username: "react_dev",
            positive_count: 1,
            negative_count: 0,
            neutral_count: 0,
            average_confidence: 0.5714285714285714,
          },
          {
            user_id: 103,
            username: "ai_researcher",
            positive_count: 1,
            negative_count: 0,
            neutral_count: 0,
            average_confidence: 0.6,
          },
          {
            user_id: 102,
            username: "sports_fan",
            positive_count: 1,
            negative_count: 0,
            neutral_count: 0,
            average_confidence: 0.6428571428571428,
          },
          {
            user_id: 101,
            username: "webdev_enthusiast",
            positive_count: 1,
            negative_count: 0,
            neutral_count: 0,
            average_confidence: 0.75,
          },
        ],
      },
      topics: [
        {
          id: 16,
          name: "General Discussion",
          keywords: ["general", "discussion", "chat"],
          is_new: false,
          message_count: 1,
        },
        {
          id: 15,
          name: "Programming & Development",
          keywords: ["programming", "development", "code"],
          is_new: false,
          message_count: 1,
        },
        {
          id: 17,
          name: "General Discussion",
          keywords: ["general", "discussion", "chat"],
          is_new: true,
          message_count: 1,
        },
        {
          id: 18,
          name: "General Discussion",
          keywords: ["general", "discussion", "chat"],
          is_new: true,
          message_count: 1,
        },
      ],
      assignments_summary: [
        {
          message_id: 589888,
          topic_id: 17,
          topic_name: "General Discussion",
          topic_confidence: 1,
          is_new_topic: true,
          message_preview:
            "I hate this new update, it's terrible! Everything ...",
          user: {
            id: 105,
            username: "frustrated_user",
          },
          sentiment: "negative",
        },
        {
          message_id: 388548,
          topic_id: 14,
          topic_name: "General Discussion",
          topic_confidence: 0.7924247812140777,
          is_new_topic: false,
          message_preview:
            "React hooks are so much better than class componen...",
          user: {
            id: 104,
            username: "react_dev",
          },
          sentiment: "positive",
        },
        {
          message_id: 639454,
          topic_id: 18,
          topic_name: "General Discussion",
          topic_confidence: 1,
          is_new_topic: true,
          message_preview:
            "This new AI research paper on neural networks is g...",
          user: {
            id: 103,
            username: "ai_researcher",
          },
          sentiment: "positive",
        },
        {
          message_id: 635246,
          topic_id: 15,
          topic_name: "Programming & Development",
          topic_confidence: 0.7207983471776482,
          is_new_topic: false,
          message_preview:
            "The football game last night was incredible! What ...",
          user: {
            id: 102,
            username: "sports_fan",
          },
          sentiment: "positive",
        },
        {
          message_id: 408202,
          topic_id: 16,
          topic_name: "General Discussion",
          topic_confidence: 0.7745326521381823,
          is_new_topic: false,
          message_preview:
            "I absolutely love this new JavaScript framework! I...",
          user: {
            id: 101,
            username: "webdev_enthusiast",
          },
          sentiment: "positive",
        },
      ],
    },
  },
};

const mockUsers: User[] = [
  {
    id: "1",
    username: "mazhutoanton",
    account_id: "6R44Eo6brL3YMMtFuocjgdCN9REzpHHWCGS5AVh49btFN13J",
    completed_at: "2025-07-20T19:34:00.000Z",
    total_points: 280,
    quests_completed: 7,
    last_activity: "2025-07-22T10:04:38.399Z",
  },
  {
    id: "2",
    username: "cryptotrader99",
    account_id: "5A3xK8oWx4qtqAqUkjX2KaCa8CgSRhkckQX2Tz4E8GMxhGjM",
    completed_at: "2025-07-21T14:22:15.000Z",
    total_points: 195,
    quests_completed: 5,
    last_activity: "2025-07-21T16:45:22.000Z",
  },
  {
    id: "3",
    username: "defi_explorer",
    account_id: "1A1LLiH7vQ5Vpm7JMaiL125RHNFMEQZvBvkVwANffAzXgSP",
    completed_at: "2025-07-19T09:15:30.000Z",
    total_points: 340,
    quests_completed: 9,
    last_activity: "2025-07-22T08:30:15.000Z",
  },
  {
    id: "4",
    username: "blockchain_bob",
    account_id: "12D3KooWBmAwcd4PJNJvfV89HwE48nwkRmAgo8Vy3uQEyNNHBox2",
    completed_at: "2025-07-18T20:45:12.000Z",
    total_points: 150,
    quests_completed: 4,
    last_activity: "2025-07-20T12:15:45.000Z",
  },
  {
    id: "5",
    username: "yield_farmer",
    account_id: "14E5nqKAp3oAJcmzgZhUD2RcptBeUBScxKHgJKU4HPNcKVf3",
    completed_at: "2025-07-17T11:30:45.000Z",
    total_points: 220,
    quests_completed: 6,
    last_activity: "2025-07-19T14:20:30.000Z",
  },
];

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
              account_id: "6R44Eo6brL3YMMtFuocjgdCN9REzpHHWCGS5AVh49btFN13J"
            },
          }),
        },
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.result.data.data.users;
    } catch (e) {}
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
      return {startedDexSwap: 0, completedTrade: 0, connectedCereWallet: 0, executedAt: new Date().toISOString()};
    }
  },

  // Community Data
  async getCommunityData(): Promise<CommunityData> {
    logger.debug("Fetching community data");

    try {
      if (env.ENVIRONMENT === "development") {
        await new Promise((resolve) => setTimeout(resolve, 300));
        logger.debug("Using mock community data");
        return mockCommunityData;
      }

      const response = await fetch(getApiUrl("community"));
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      logger.debug("Community data fetched successfully", data);
      return data;
    } catch (error) {
      logger.error("Error fetching community data:", error);
      return mockCommunityData;
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
  async getUserActivity(userId: string): Promise<any> {
    logger.debug("Fetching user activity", { userId });

    try {
      if (env.ENVIRONMENT === "development") {
        await new Promise((resolve) => setTimeout(resolve, 600));
        logger.debug("Using mock user activity data");
        return {
          username: "mazhutoanton",
          account_id: "6R44Eo6brL3YMMtFuocjgdCN9REzpHHWCGS5AVh49btFN13J",
          organization_id: "2115",
          campaign_id: "58",
          activities: {
            "2025-07-10T15:18:24.425Z": {
              account_id: "6R44Eo6brL3YMMtFuocjgdCN9REzpHHWCGS5AVh49btFN13J",
              organization_id: "2115",
              campaign_id: "58",
              quest_type: "quiz",
              points: 30,
              started_at: "2025-07-10T15:18:24.425Z",
              payload: {
                answers: [
                  {
                    quiz_id: "quiz-1752158562660",
                    question_id: "question-1752158562660",
                    answer_id: "option-1-1752158562660",
                  },
                ],
              },
              completed_at: "2025-07-10T15:18:38.041Z",
            },
          },
        };
      }

      const response = await fetch(getApiUrl(`users/${userId}/activity`));
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      logger.debug("User activity fetched successfully", data);
      return data;
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
