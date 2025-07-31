import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Alert, AlertDescription } from "../ui/alert";
import { Badge } from "../ui/badge";
import {
  Loader2,
  MessageSquare,
  Hash,
  Activity,
  Users,
  AlertTriangle,
  Search
} from "lucide-react";
import { api, type ConversationTreeData, type UserDetails } from "../../lib/api";

interface AIAnalysisViewProps {
  isAuthenticated: boolean;
}

export function AIAnalysisView({ isAuthenticated }: AIAnalysisViewProps) {
  // State
  const [groupId, setGroupId] = useState("1");
  const [userId, setUserId] = useState("475644326");
  const [queryType, setQueryType] = useState<"group" | "user">("group");

  // Data state
  const [conversationData, setConversationData] = useState<ConversationTreeData | null>(null);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  console.log("🔍 Current State:", { queryType, userDetails: !!userDetails, conversationData: !!conversationData });

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
        console.log("Group Analysis Data:", treeData);
        setConversationData(treeData);
        setUserDetails(null);
      } else {
        const [treeData, userDetailsData] = await Promise.all([
          api.getLatestTree(groupId),
          api.getUserDetails(groupId, userId)
        ]);
        // Filter tree data to show only this user's conversations
        const filteredData: ConversationTreeData = {
          ...treeData,
          conversations: (treeData.conversations || []).filter(c => c.user === userId),
          userName: userDetailsData.userName
        };

        console.log("User Details Data:", userDetailsData);
        console.log("Setting userDetails with:", userDetailsData);
        setConversationData(filteredData);
        setUserDetails(userDetailsData);
        console.log("After setState - queryType:", queryType, "userDetails set");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    console.log("handleSearch called with queryType:", queryType);
    setError(null);
    if (queryType === "group") {
      fetchConversationData("group");
    } else {
      fetchConversationData("user");
    }
  };

  // Summary data for group analysis
  const trendData = {
    summaryCards: [
      {
        title: "Messages",
        value: conversationData?.stats?.totalMessages || 0,
        icon: MessageSquare,
        color: "blue",
      },
      {
        title: "Topics",
        value: conversationData?.stats?.totalTopics || 0,
        icon: Hash,
        color: "green",
      },
      {
        title: "Conversations",
        value: conversationData?.stats?.activeConversations || 0,
        icon: Activity,
        color: "purple",
      },
      {
        title: "Participants",
        value: conversationData?.stats?.totalUsers || 0,
        icon: Users,
        color: "orange",
      },
    ]
  };

  // Summary data for user analysis
  const userTrendData = {
    summaryCards: [
      {
        title: "Messages",
        value: parseInt(userDetails?.total_messages || "0"),
        icon: MessageSquare,
        color: "blue",
      },
      {
        title: "Topics",
        value: parseInt(userDetails?.unique_topics_participated || "0"),
        icon: Hash,
        color: "green",
      },
      {
        title: "Conversations",
        value: parseInt(userDetails?.unique_conversations_participated || "0"),
        icon: Activity,
        color: "purple",
      },
      {
        title: "Avg Length",
        value: Math.round(parseFloat(userDetails?.average_message_length || "0")),
        icon: Users,
        color: "orange",
      },
    ]
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
      <Card>
        <CardHeader>
          <CardTitle>AI Conversation Intelligence</CardTitle>
          <CardDescription>Deep learning insights from real conversations</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="group" onValueChange={(value) => {
            console.log("Tab changed to:", value);
            setQueryType(value as "group" | "user");
          }}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="group">Group Analysis</TabsTrigger>
              <TabsTrigger value="user">User Deep Dive</TabsTrigger>
            </TabsList>

            <TabsContent value="group" className="space-y-4">
              <Input
                placeholder="Group ID (e.g., 1)..."
                value={groupId}
                onChange={(e) => setGroupId(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button onClick={handleSearch} disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Analyzing Group...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Analyze Group
                  </>
                )}
              </Button>
            </TabsContent>

            <TabsContent value="user" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input
                  placeholder="Group ID (e.g., 1)..."
                  value={groupId}
                  onChange={(e) => setGroupId(e.target.value)}
                />
                <Input
                  placeholder="User ID (e.g., 475644326)..."
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <Button onClick={handleSearch} disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Analyzing User...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Deep Dive Analysis
                  </>
                )}
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="w-4 h-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Show results for GROUP analysis */}
      {!loading && conversationData && queryType === "group" && (
        <div className="space-y-6">
          {/* Summary Stats */}
          {conversationData && (conversationData.stats || conversationData.users) && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {trendData.summaryCards.map((card, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{card.title}</p>
                        <p className="text-xl font-bold">{card.value}</p>
                      </div>
                      <card.icon className={`w-6 h-6 text-${card.color}-500`} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Group Analysis Content */}
          <div className="space-y-4">
            <h4 className="font-medium">Active Users ({Object.keys(conversationData.users || {}).length})</h4>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Object.entries(conversationData.users || {}).map(([userId, user]) => (
                <Card key={userId}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium">{user.name}</h5>
                      <Badge variant="outline">{user.messageIds?.length || 0} msgs</Badge>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Last Activity: {new Date(user.lastActivity).toLocaleDateString()}</p>
                      <p>Avg Message Length: {user.communicationStyle?.averageMessageLength || 0}</p>
                      <p>Response Pattern: {user.communicationStyle?.responsePattern || "unknown"}</p>
                      <p>Topics: {Object.keys(user.topicParticipation || {}).length}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Show results for USER analysis */}
      {!loading && userDetails && queryType === "user" && (
        <div className="space-y-6">
          {/* User Profile Header */}
          <Card className="border-blue-200 bg-blue-50/30 dark:bg-blue-900/10">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {userDetails.user_name || userDetails.userName || "Unknown User"}
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge variant="outline">ID: {userDetails.user_id || userDetails.userId}</Badge>
                    <Badge variant="outline">Group: {userDetails.group_id || userDetails.groupId}</Badge>
                    <Badge variant={userDetails.response_pattern === "unknown" ? "secondary" : "default"}>
                      {userDetails.response_pattern || "unknown"} pattern
                    </Badge>
                  </div>
                  {userDetails.last_activity && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Last Activity: {new Date(userDetails.last_activity).toLocaleString()}
                    </p>
                  )}
                  {userDetails.user_created_at && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Account Created: {new Date(userDetails.user_created_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600 mb-1">
                    {Math.round(parseFloat(userDetails.average_message_length || "0"))}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Avg Chars</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statistics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {userTrendData.summaryCards.map((card, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{card.title}</p>
                      <p className="text-2xl font-bold">{card.value}</p>
                    </div>
                    <card.icon className={`w-6 h-6 text-${card.color}-500`} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Messages by Topics */}
          {userDetails.messages_by_topics && userDetails.messages_by_topics.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hash className="w-5 h-5" />
                  Messages by Topics ({userDetails.messages_by_topics.length} topics)
                </CardTitle>
                <CardDescription>User's engagement across different conversation topics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userDetails.messages_by_topics.map((topic, index) => (
                    <Card key={topic.topic_id || index} className="border-l-4 border-l-blue-500">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{topic.topic_name}</CardTitle>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{topic.message_count} messages</Badge>
                            <Badge variant={topic.message_count > 1 ? "default" : "secondary"} className="text-xs">
                              {topic.message_count > 1 ? "Active" : "Single"}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {topic.messages?.map((message) => {
                            const sentimentColor = message.sentiment === 'positive' ? 'border-l-green-400 bg-green-50' :
                                                 message.sentiment === 'negative' ? 'border-l-red-400 bg-red-50' : 'border-l-gray-400 bg-gray-50';

                            return (
                              <div key={message.message_id} className={`border-l-4 pl-4 py-2 rounded-r ${sentimentColor}`}>
                                <p className="text-sm mb-2 font-medium">{message.content}</p>
                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                  <span className="font-medium">{new Date(message.timestamp).toLocaleString()}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {message.sentiment}
                                  </Badge>
                                  <span className="font-mono text-xs">#{message.message_id}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Messages Timeline */}
          {userDetails.recent_messages && userDetails.recent_messages.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Recent Messages Timeline ({userDetails.recent_messages.length} messages)
                </CardTitle>
                <CardDescription>Chronological view of user's latest activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {userDetails.recent_messages.map((message, index) => {
                    const sentimentColor = message.sentiment === 'positive' ? 'bg-green-50 border-green-200' :
                                         message.sentiment === 'negative' ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200';

                    return (
                      <Card key={message.message_id} className={`hover:shadow-md transition-shadow ${sentimentColor}`}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-sm mb-2 font-medium">{message.content}</p>
                              <div className="flex items-center gap-2 text-xs text-gray-600">
                                <span className="font-medium">{new Date(message.timestamp).toLocaleString()}</span>
                                <Badge variant="outline" className="text-xs">
                                  {message.topic_name}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {message.sentiment}
                                </Badge>
                                <span className="text-xs font-mono">#{message.message_id}</span>
                              </div>
                            </div>
                            <div className="text-right ml-4">
                              <div className="text-xs text-gray-500">
                                {index + 1} of {userDetails.recent_messages?.length || 0}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Conversation IDs */}
          {userDetails.conversation_ids && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Conversation Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    <strong>Conversation IDs:</strong>
                  </p>
                  <p className="text-xs text-gray-500 font-mono break-all bg-gray-50 p-2 rounded">
                    {userDetails.conversation_ids}
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Context Windows:</span> {userDetails.total_context_windows || 0}
                    </div>
                    <div>
                      <span className="font-medium">Relationships:</span> {userDetails.total_relationships || 0}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading AI analysis data...</p>
          </div>
        </div>
      )}

      {/* Empty States */}
      {!loading && queryType === "group" && conversationData && !conversationData.stats && !conversationData.users && (
        <Card>
          <CardContent className="p-8 text-center">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Group Data Found</h3>
            <p className="text-gray-500 dark:text-gray-400">
              No group data found for the specified group ID.
              Try adjusting your search parameters.
            </p>
          </CardContent>
        </Card>
      )}

      {!loading && queryType === "user" && userDetails && !userDetails.messages_by_topics && !userDetails.recent_messages && (
        <Card>
          <CardContent className="p-8 text-center">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No User Data Found</h3>
            <p className="text-gray-500 dark:text-gray-400">
              No message data found for user {userDetails.user_name || userDetails.userName}.
              Try a different user ID.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
