import { logger, env } from "./env";
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
  external_wallet_address?: string;
  invitees?: string[];
  quests?: {
    quizTasks?: Array<{
      id: string;
      title: string;
      completed: boolean;
      questions?: any[];
    }>;
    videoTasks?: Array<{
      id: string;
      title: string;
      type: string;
      completed: boolean;
      points: number;
    }>;
    socialTasks?: Array<{
      id: string;
      completed: boolean;
    }>;
    customTasks?: Array<{
      id: string;
      title: string;
      type: string;
      subtype?: string;
      completed: boolean;
      points: number;
    }>;
    dexTasks?: Array<{
      id: string;
      completed: boolean;
    }>;
    referralTask?: any;
  };
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

// AI Analysis Types
export interface ConversationNode {
  id: string;
  message: string;
  timestamp: string;
  user: string;
  topic: string;
  sentiment?: string;
  conversationId?: string;
  replyToMessageId?: string | null;
}

export interface TreeUser {
  id: number;
  name: string;
  messageIds: number[];
  lastActivity: string;
  communicationStyle: {
    topTopics: number[];
    emojiUsage: number;
    responsePattern: string;
    averageMessageLength: number;
  };
  topicParticipation: Record<string, number>;
  activeConversations: any[];
  recentInteractions: Record<string, any>;
}

export interface ConversationTreeData {
  queryId?: string;
  userName?: string;
  conversations?: ConversationNode[];
  metadata?: any;
  // New real data structure
  stats?: {
    totalUsers: number;
    totalTopics: number;
    totalMessages: number;
    lastProcessedTime: string;
    activeConversations: number;
    activeContextWindows: number;
    trackedRelationships: number;
  };
  users?: Record<string, TreeUser>;
}

export interface MessagesByTopic {
  topic_id: number;
  topic_name: string;
  message_count: number;
  messages: Array<{
    message_id: number;
    content: string;
    timestamp: string;
    sentiment: string;
    toxicity: any;
    conversation_id: string;
    reply_to_message_id: any;
  }>;
}

export interface RecentMessage {
  message_id: number;
  content: string;
  timestamp: string;
  topic_name: string;
  sentiment: string;
  conversation_id: string;
}

export interface UserDetails {
  userId?: string;
  userName?: string;
  groupId?: string;
  conversations?: ConversationNode[];
  statistics?: {
    messageCount: number;
    topicsEngaged: number;
    sentimentBreakdown: Record<string, number>;
  };
  // New real data structure matching your API response exactly
  user_id?: string;
  user_name?: string;
  group_id?: string;
  total_messages?: string;
  total_conversations?: string;
  unique_topics_participated?: string;
  unique_conversations_participated?: string;
  average_message_length?: string;
  last_activity?: string;
  user_created_at?: string;
  user_updated_at?: string;
  version_created?: string;
  version_updated?: string;
  messages_by_topics?: MessagesByTopic[];
  recent_messages?: RecentMessage[];
  conversation_ids?: string;
  response_pattern?: string;
  total_context_windows?: string;
  total_relationships?: string;
  relationship_details?: any[];
  context_window_details?: any[];
  emoji_usage?: any;
}

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
    dateFrom,
    dateTo,
  }: {
    campaignId: string;
    organizationId: string;
    dateFrom: string;
    dateTo: string;
  }): Promise<User[]> {
    try {
      console.log("📡 API getUsers called with params:", {
        campaign_id: campaignId,
        organization_id: organizationId,
        date_from: dateFrom,
        date_to: dateTo,
      });

      console.log("Date range:", {
        from: new Date(dateFrom).toLocaleDateString(),
        to: new Date(dateTo).toLocaleDateString(),
        daysRange: Math.ceil((new Date(dateTo).getTime() - new Date(dateFrom).getTime()) / (1000 * 60 * 60 * 24))
      });

      const params: any = {
        campaign_id: campaignId,
        organization_id: organizationId,
        account_id: "6R44Eo6brL3YMMtFuocjgdCN9REzpHHWCGS5AVh49btFN13J",
      };

      if (dateFrom && dateFrom !== "Invalid Date") {
        params.date_from = dateFrom;
      }
      if (dateTo && dateTo !== "Invalid Date") {
        params.date_to = dateTo;
      }

      console.log("Final API params:", params);

      const response = await fetch(
        `${env.RULE_SERVICE_API_URL}/data-service/${env.DATA_SERVICE_ID}/query/get_leaderboard_for_funnel`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            params,
          }),
        },
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("API response:", data);
      console.log("Users count:", data.result?.data?.data?.users?.length || 0);

      const users = data.result.data.data.users;

      return users;
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

  // AI Analysis APIs
  async getLatestTree(groupId: string): Promise<ConversationTreeData> {
    logger.debug("Fetching latest conversation tree", { groupId });

    try {
      const response = await fetch(
        "https://ai-rule.stage.cere.io/rule/data-service/2599/query/get_latest_tree",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            params: {
              groupId: groupId,
            },
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      logger.debug("Latest tree data fetched successfully", data);

      // Extract real data structure for group analysis
      const treeBlob = data.result?.data?.data?.tree_blob || {};
      logger.debug("Tree blob structure:", {
        hasStats: !!treeBlob.stats,
        hasUsers: !!treeBlob.users,
        hasMessages: !!treeBlob.messages,
        hasTopics: !!treeBlob.topics,
        messagesType: typeof treeBlob.messages,
        messagesKeys: treeBlob.messages ? Object.keys(treeBlob.messages).length : 0,
        usersKeys: treeBlob.users ? Object.keys(treeBlob.users).length : 0,
        topicsKeys: treeBlob.topics ? Object.keys(treeBlob.topics).length : 0
      });

      // Transform the data like in conversation-dashboard
      const conversations = transformGroupTreeData(treeBlob);

      return {
        queryId: `group_${groupId}`,
        stats: treeBlob.stats || {
          totalUsers: Object.keys(treeBlob.users || {}).length,
          totalTopics: Object.keys(treeBlob.topics || {}).length,
          totalMessages: Object.keys(treeBlob.messages || {}).length,
          lastProcessedTime: new Date().toISOString(),
          activeConversations: 0,
          activeContextWindows: 0,
          trackedRelationships: 0,
        },
        users: treeBlob.users || {},
        conversations: conversations,
        metadata: data.metadata,
      };
    } catch (error) {
      logger.error("Error fetching latest tree:", error);
      return {
        queryId: groupId,
        stats: {
          totalUsers: 0,
          totalTopics: 0,
          totalMessages: 0,
          lastProcessedTime: new Date().toISOString(),
          activeConversations: 0,
          activeContextWindows: 0,
          trackedRelationships: 0,
        },
        users: {},
        conversations: [],
        metadata: null,
      };
    }
  },

  async getUserDetails(groupId: string, userId: string): Promise<UserDetails> {
    logger.debug("Fetching user details", { groupId, userId });

    try {
      const response = await fetch(
        "https://ai-rule.stage.cere.io/rule/data-service/2599/query/get_user_details",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            params: {
              groupId: groupId,
              userId: parseInt(userId, 10),
            },
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      logger.debug("User details fetched successfully", data);

      return this.processUserDetailsResponse(data, userId, groupId);
    } catch (error) {
      logger.error("Error fetching user details:", error);
      return this.createEmptyUserDetails(userId, groupId);
    }
  },

  async getUserDetailsByUsername(groupId: string, userName: string): Promise<UserDetails> {
    logger.debug("Fetching user details by username", { groupId, userName });

    try {
      const response = await fetch(
        "https://ai-rule.stage.cere.io/rule/data-service/2599/query/get_user_details",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            params: {
              groupId: groupId,
              userName: userName,
              userId: 0,
            },
          }),
        },
      );

      const data = await response.json();
      logger.debug("User details by username fetched successfully", data);

      return this.processUserDetailsResponse(data, "0", groupId);
    } catch (error) {
      logger.error("Error fetching user details by username:", error);
      return this.createEmptyUserDetails("0", groupId);
    }
  },

  processUserDetailsResponse(data: any, userId: string, groupId: string): UserDetails {
    // Extract real data structure from the actual API response
    const userData = data.result?.data?.data || {};

    // Process sentiment breakdown and extract all messages from messages_by_topics
    const sentimentBreakdown: Record<string, number> = {};
    const allMessages: ConversationNode[] = [];

    if (userData.messages_by_topics && Array.isArray(userData.messages_by_topics)) {
      userData.messages_by_topics.forEach((topic: any) => {
        if (topic.messages && Array.isArray(topic.messages)) {
          topic.messages.forEach((message: any) => {
            const sentiment = message.sentiment || 'neutral';
            sentimentBreakdown[sentiment] = (sentimentBreakdown[sentiment] || 0) + 1;

            // Create conversation node like in conversation-dashboard
            allMessages.push({
              id: message.message_id?.toString() || `msg_${Date.now()}_${Math.random()}`,
              message: message.content || message.message || "No content",
              timestamp: message.timestamp || new Date().toISOString(),
              user: userData.user_name || `User ${userId}`,
              topic: topic.topic_name || "Unknown Topic",
              sentiment: message.sentiment,
              conversationId: message.conversation_id?.toString(),
              replyToMessageId: message.reply_to_message_id?.toString(),
            });
          });
        }
      });
    }

    // Sort messages by timestamp (most recent first)
    allMessages.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return {
      // Old structure for compatibility
      userId,
      userName: userData.user_name || "Unknown User",
      groupId,
      conversations: allMessages,
      statistics: {
        messageCount: parseInt(userData.total_messages || "0"),
        topicsEngaged: parseInt(userData.unique_topics_participated || "0"),
        sentimentBreakdown,
      },
      // New real data structure matching your API response
      user_id: userData.user_id,
      user_name: userData.user_name,
      group_id: userData.group_id,
      total_messages: userData.total_messages,
      total_conversations: userData.total_conversations,
      unique_topics_participated: userData.unique_topics_participated,
      unique_conversations_participated: userData.unique_conversations_participated,
      average_message_length: userData.average_message_length,
      last_activity: userData.last_activity,
      user_created_at: userData.user_created_at,
      user_updated_at: userData.user_updated_at,
      version_created: userData.version_created,
      version_updated: userData.version_updated,
      messages_by_topics: userData.messages_by_topics || [],
      recent_messages: userData.recent_messages || [],
      conversation_ids: userData.conversation_ids,
      response_pattern: userData.response_pattern,
      total_context_windows: userData.total_context_windows,
      total_relationships: userData.total_relationships,
      relationship_details: userData.relationship_details || [],
      context_window_details: userData.context_window_details || [],
      emoji_usage: userData.emoji_usage,
    };
  },

  createEmptyUserDetails(userId: string, groupId: string): UserDetails {
    return {
      userId,
      userName: "Unknown User",
      groupId,
      conversations: [],
      statistics: {
        messageCount: 0,
        topicsEngaged: 0,
        sentimentBreakdown: {},
      },
      // Return empty data structure on error
      user_id: userId,
      user_name: "Unknown User",
      group_id: groupId,
      total_messages: "0",
      total_conversations: "0",
      unique_topics_participated: "0",
      unique_conversations_participated: "0",
      average_message_length: "0",
      last_activity: "",
      user_created_at: "",
      user_updated_at: "",
      version_created: "",
      version_updated: "",
      messages_by_topics: [],
      recent_messages: [],
      conversation_ids: "",
      response_pattern: "unknown",
      total_context_windows: "0",
      total_relationships: "0",
      relationship_details: [],
      context_window_details: [],
      emoji_usage: null,
    };
  },
};

// Helper function to transform group tree data like in conversation-dashboard
function transformGroupTreeData(treeBlob: any): ConversationNode[] {
  if (!treeBlob.users || !treeBlob.messages) {
    logger.debug("Missing users or messages in tree_blob", {
      hasUsers: !!treeBlob.users,
      hasMessages: !!treeBlob.messages
    });
    return [];
  }

  const users = treeBlob.users;
  const messages = treeBlob.messages;
  const topics = treeBlob.topics || {};

  logger.debug("Transforming tree data:", {
    messageCount: Object.keys(messages).length,
    userCount: Object.keys(users).length,
    topicCount: Object.keys(topics).length
  });

  return Object.values(messages).map((message: any) => ({
    id: message.id?.toString() || `msg_${Date.now()}_${Math.random()}`,
    message: message.content || message.message || "No content",
    timestamp: message.timestamp || new Date().toISOString(),
    user: users[message.userId]?.name || `User ${message.userId}` || "Unknown User",
    topic: topics[message.topicId]?.name || `Topic ${message.topicId}` || "Unknown Topic",
    sentiment: message.sentiment,
    conversationId: message.conversationId?.toString(),
    replyToMessageId: message.replyToMessageId?.toString(),
  }));
}
