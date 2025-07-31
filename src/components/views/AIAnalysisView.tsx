import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Loader2,
  MessageSquare,
  Hash,
  TrendingUp,
  Users,
  AlertTriangle,
  Search
} from "lucide-react";
import { api, type ConversationTreeData, type UserDetails } from "../../lib/api";
import { ConversationTree } from "../conversation-tree";
import { TopicTree } from "../topic-tree";

interface AIAnalysisViewProps {
  isAuthenticated: boolean;
}

export function AIAnalysisView({ isAuthenticated }: AIAnalysisViewProps) {
  // State
  const [groupId, setGroupId] = useState("1");
  const [userId, setUserId] = useState("475644326");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data state
  const [conversationData, setConversationData] = useState<ConversationTreeData | null>(null);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);

  // Determine query type based on whether we have user details
  const queryType: "group" | "user" = userDetails ? "user" : "group";

  // Fetch conversation data
  const fetchConversationData = async (type: "group" | "user") => {
    if (type === "group" && !groupId.trim()) {
      setError("Please enter a group ID");
      return;
    }
    if (type === "user" && (!groupId.trim() || !userId.trim())) {
      setError("Please enter both group ID and user ID");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (type === "group") {
        const treeData = await api.getLatestTree(groupId);
        setConversationData(treeData);
        setUserDetails(null);
      } else {
        const userDetailsData = await api.getUserDetails(groupId, userId);
        
        // Create ConversationTreeData from user details for consistency
        const userConversationData: ConversationTreeData = {
          queryId: `user_${userId}`,
          userName: userDetailsData.user_name || userDetailsData.userName,
          conversations: userDetailsData.conversations || [],
          metadata: {
            totalMessages: userDetailsData.conversations?.length || 0,
            participants: [userDetailsData.user_name || userDetailsData.userName || `User ${userId}`],
            lastUpdated: new Date().toISOString(),
          },
          stats: {
            totalUsers: 1,
            totalTopics: userDetailsData.messages_by_topics?.length || 0,
            totalMessages: userDetailsData.conversations?.length || 0,
            lastProcessedTime: new Date().toISOString(),
            activeConversations: parseInt(userDetailsData.unique_conversations_participated || "0"),
            activeContextWindows: 0,
            trackedRelationships: 0,
          },
          users: {}
        };

        setConversationData(userConversationData);
        setUserDetails(userDetailsData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = () => {
    setError(null);
    if (queryType === "group") {
      fetchConversationData("group");
    } else {
      fetchConversationData("user");
    }
  };



  if (!isAuthenticated) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Authentication Required</h3>
          <p className="text-gray-500 dark:text-gray-400">
            Please connect your wallet to access AI Analysis features.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          AI NLP insights
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Deep learning insights from real conversations
        </p>
      </div>

      {/* Conversation Query */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Conversation Query</CardTitle>
          <CardDescription>Analyze group conversations and user interactions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Tabs defaultValue="group" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="group">Group Analysis</TabsTrigger>
              <TabsTrigger value="user">User Deep Dive</TabsTrigger>
            </TabsList>

                <TabsContent value="group" className="space-y-4 mt-4">
                  <div className="flex gap-2">
              <Input
                placeholder="Group ID (e.g., 1)..."
                value={groupId}
                onChange={(e) => setGroupId(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleAnalyze()}
                      className="flex-1"
              />
                    <Button onClick={handleAnalyze} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Analyzing...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Analyze Group
                  </>
                )}
              </Button>
                  </div>
            </TabsContent>

                <TabsContent value="user" className="space-y-4 mt-4">
                  <div className="flex gap-2">
                <Input
                  placeholder="Group ID (e.g., 1)..."
                  value={groupId}
                  onChange={(e) => setGroupId(e.target.value)}
                      className="flex-1"
                />
                <Input
                  placeholder="User ID (e.g., 475644326)..."
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleAnalyze()}
                      className="flex-1"
                />
                    <Button onClick={handleAnalyze} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Analyzing...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                          Analyze User
                  </>
                )}
              </Button>
                  </div>
            </TabsContent>
          </Tabs>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics - Show real data when available */}
      {(conversationData || userDetails) && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-600" />
                      <div>
                <div className="text-2xl font-bold">
                  {(conversationData?.conversations && Array.isArray(conversationData.conversations) ? 
                    conversationData.conversations.length : 0) ||
                   userDetails?.total_messages ||
                   userDetails?.messages_by_topics?.reduce((sum, topic) => sum + topic.message_count, 0) ||
                   0}
                      </div>
                <div className="text-sm text-gray-600">Messages</div>
                    </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Hash className="w-5 h-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold">
                  {(() => {
                    if (userDetails?.messages_by_topics?.length) {
                      return userDetails.messages_by_topics.length;
                    }
                    if (conversationData?.users) {
                      const topicSet = new Set<string>();
                      Object.values(conversationData.users).forEach(user => {
                        if (user.topicParticipation) {
                          Object.keys(user.topicParticipation).forEach(topicId => topicSet.add(topicId));
                        }
                      });
                      return topicSet.size;
                    }
                    return 0;
                  })()}
                    </div>
                <div className="text-sm text-gray-600">Topics</div>
                    </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
                <div>
                <div className="text-2xl font-bold">
                  {userDetails?.unique_conversations_participated ||
                   (conversationData?.conversations && Array.isArray(conversationData.conversations) ? 
                     new Set(conversationData.conversations.map(c => c.conversationId)).size : 0)}
                </div>
                <div className="text-sm text-gray-600">Conversations</div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-orange-600" />
                    <div>
                <div className="text-2xl font-bold">
                  {Object.keys(conversationData?.users || {}).length ||
                   (userDetails ? 1 : 0)}
                </div>
                <div className="text-sm text-gray-600">Participants</div>
                    </div>
                  </div>
              </Card>
          </div>
      )}

      {/* Interactive Visualization */}
      {conversationData && (
            <Card>
              <CardHeader>
          <CardTitle className="text-lg">Interactive Visualization</CardTitle>
          <CardDescription>Explore your data through different perspectives</CardDescription>
              </CardHeader>
              <CardContent>
            <Tabs defaultValue="conversation">
            <TabsList className="w-full">
              <TabsTrigger value="conversation" className="w-full">Conversation Tree</TabsTrigger>
              <TabsTrigger value="topic" className="w-full">Topic Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="conversation" className="mt-6">
                <ConversationTree data={conversationData} queryType={queryType} />
            </TabsContent>

            <TabsContent value="topic" className="mt-6">
                <TopicTree data={conversationData} queryType={queryType} />
            </TabsContent>
          </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Loading state */}
      {loading && (
        <Card>
          <CardContent className="p-8 text-center">
            <Loader2 className="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Loading Analysis</h3>
            <p className="text-gray-500 dark:text-gray-400">
              Fetching conversation data...
            </p>
          </CardContent>
        </Card>
      )}

      {/* Show loading state when no data */}
      {!conversationData && !loading && !error && (
        <Card>
          <CardContent className="p-8 text-center">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Data Available</h3>
            <p className="text-gray-500 dark:text-gray-400">
              Please analyze a group or user to see conversation insights.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-medium">Error</span>
            </div>
            <p className="text-red-600 mt-2">{error}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
