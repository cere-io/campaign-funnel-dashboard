import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import {
  Loader2,
  MessageSquare,
  Hash,
  TrendingUp,
  Users,
  AlertTriangle,
  Search,
  ChevronDown,
  ChevronRight
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
  const [loading, setLoading] = useState(false);
  const [, setError] = useState<string | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  // Data state
  const [conversationData, setConversationData] = useState<ConversationTreeData | null>(null);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [loadingUserDetails, setLoadingUserDetails] = useState<Set<string>>(new Set());
  const [cachedUserDetails, setCachedUserDetails] = useState<Record<string, UserDetails>>({});

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
        console.log("Conversations available:", treeData.conversations?.length || 0);
        console.log("Sample conversation:", treeData.conversations?.[0]);
        console.log("Users data:", treeData.users);
        if (treeData.users && Object.keys(treeData.users).length > 0) {
          const firstUserId = Object.keys(treeData.users)[0];
          const firstUser = treeData.users[firstUserId];
          console.log(`Sample user ${firstUserId}:`, firstUser);
          console.log(`User topicParticipation:`, firstUser.topicParticipation);
        }
        setConversationData(treeData);
        setUserDetails(null);
        setCachedUserDetails({}); // Clear cache when loading new group

        // Auto-expand first user and first topic if available
        if (treeData.users && Object.keys(treeData.users).length > 0) {
          const firstUserId = Object.keys(treeData.users)[0];
          const firstUser = treeData.users[firstUserId];
          const expandedSet = new Set([firstUserId]);

          // Also expand first topic if it has messages
          if (firstUser.topicParticipation && Object.keys(firstUser.topicParticipation).length > 0) {
            const firstTopicId = Object.keys(firstUser.topicParticipation)[0];
            const topicNodeId = `${firstUserId}_topic_${firstTopicId}`;

            // Check if this topic has messages in conversations
            const hasMessages = Array.isArray(treeData.conversations) && treeData.conversations.some(
              conv => conv.user === firstUserId && conv.topic === firstTopicId
            );

            if (hasMessages) {
              expandedSet.add(topicNodeId);
            }
          }

          setExpandedNodes(expandedSet);
        }
      } else {
        const [treeData, userDetailsData] = await Promise.all([
          api.getLatestTree(groupId),
          api.getUserDetails(groupId, userId)
        ]);

        console.log("User Details Data:", userDetailsData);
        setConversationData(treeData);
        setUserDetails(userDetailsData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

    // Load user details for specific user when needed
  const loadUserDetailsForMessages = async (targetUserId: string) => {
    if (loadingUserDetails.has(targetUserId) || cachedUserDetails[targetUserId]) {
      return; // Already loaded or loading
    }

    setLoadingUserDetails(prev => new Set([...prev, targetUserId]));

    try {
      const userDetailsData = await api.getUserDetails(groupId, targetUserId);
      console.log(`User details for ${targetUserId}:`, userDetailsData);
      console.log(`Topics available for ${targetUserId}:`, userDetailsData.messages_by_topics?.length || 0);
      if (userDetailsData.messages_by_topics && userDetailsData.messages_by_topics.length > 0) {
        console.log(`Sample topic for ${targetUserId}:`, userDetailsData.messages_by_topics[0]);
      }

      // Cache the user details
      setCachedUserDetails(prev => ({
        ...prev,
        [targetUserId]: userDetailsData
      }));

      // If this is the current user being viewed in user mode, update userDetails
      if (queryType === "user" && targetUserId === userId) {
        setUserDetails(userDetailsData);
      }

    } catch (err) {
      console.error(`Failed to load user details for ${targetUserId}:`, err);
    } finally {
      setLoadingUserDetails(prev => {
        const newSet = new Set(prev);
        newSet.delete(targetUserId);
        return newSet;
      });
    }
  };

  const handleAnalyze = () => {
    console.log("handleAnalyze called with queryType:", queryType);
    setError(null);
    if (queryType === "group") {
      fetchConversationData("group");
    } else {
      fetchConversationData("user");
    }
  };

  const toggleNode = (nodeId: string) => {
    console.log(`Toggling node: ${nodeId}`);
    console.log(`Current expanded nodes:`, Array.from(expandedNodes));

    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      console.log(`Collapsing node: ${nodeId}`);
      newExpanded.delete(nodeId);
    } else {
      console.log(`Expanding node: ${nodeId}`);
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);

    console.log(`New expanded nodes:`, Array.from(newExpanded));
  };

  // Get messages for a specific user and topic (memoized to avoid excessive calls)
  const getMessagesForUserTopic = (userId: string, topicId: string) => {
    // Try to get from conversations first
    if (Array.isArray(conversationData?.conversations) && conversationData.conversations.length > 0) {
      const filteredConvs = conversationData.conversations.filter(
        conv => conv.user === userId && conv.topic === topicId
      );
      if (filteredConvs.length > 0) return filteredConvs;
    }

    // Try cached user details first
    const cachedUser = cachedUserDetails[userId];
    if (cachedUser && cachedUser.messages_by_topics) {
      const topic = cachedUser.messages_by_topics.find(t => t.topic_id.toString() === topicId);
      if (topic && topic.messages) {
        // Convert to ConversationNode format
        return topic.messages.map(msg => ({
          id: msg.message_id.toString(),
          message: msg.content,
          timestamp: msg.timestamp,
          user: userId,
          topic: topicId,
          sentiment: msg.sentiment,
          conversationId: msg.conversation_id
        }));
      }
    }

    // Fallback: if we have userDetails and it's for this user, use that data
    if (userDetails && userDetails.user_id === userId && userDetails.messages_by_topics) {
      const topic = userDetails.messages_by_topics.find(t => t.topic_id.toString() === topicId);
      if (topic && topic.messages) {
        // Convert to ConversationNode format
        return topic.messages.map(msg => ({
          id: msg.message_id.toString(),
          message: msg.content,
          timestamp: msg.timestamp,
          user: userId,
          topic: topicId,
          sentiment: msg.sentiment,
          conversationId: msg.conversation_id
        }));
      }
    }

    return [];
  };

  // Render real conversation tree based on API data
  const renderUserNode = (userId: string, user: any) => {
    const isExpanded = expandedNodes.has(userId);
    const hasTopics = user.topicParticipation && Object.keys(user.topicParticipation).length > 0;
    const messageCount = user.messageIds?.length || 0;
    const topicsCount = Object.keys(user.topicParticipation || {}).length;

    return (
      <div key={userId}>
        <div
          className="flex items-center gap-2 py-2 px-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded cursor-pointer"
          onClick={() => hasTopics && toggleNode(userId)}
        >
          {hasTopics && (
            isExpanded ?
              <ChevronDown className="w-4 h-4 text-gray-500" /> :
              <ChevronRight className="w-4 h-4 text-gray-500" />
          )}

          <div className="flex items-center gap-3 w-full">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {user.name?.charAt(0) || userId.charAt(0)}
            </div>

            <div className="flex-1">
              <div className="font-medium text-sm">{user.name || `User ${userId}`}</div>
              <div className="text-xs text-gray-500">
                {messageCount} messages across {topicsCount} topics
              </div>
            </div>

            <Badge variant="secondary" className="text-xs">
              {messageCount}
            </Badge>
          </div>
        </div>

        {hasTopics && isExpanded && (
          <div style={{ paddingLeft: "24px" }}>
            {Object.entries(user.topicParticipation || {}).map(([topicId, count]) => {
              const topicNodeId = `${userId}_topic_${topicId}`;
              const isTopicExpanded = expandedNodes.has(topicNodeId);
              const topicMessages = getMessagesForUserTopic(userId, topicId);
              const hasMessages = topicMessages.length > 0;

              return (
                <div key={topicId}>
                  <div
                    className="flex items-center gap-3 py-2 px-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded"
                  >
                    <div
                      className="flex items-center gap-3 flex-1 cursor-pointer"
                      onClick={async () => {
                        console.log(`Topic clicked: ${topicId} for user ${userId}`);
                        console.log(`Current expanded state: ${isTopicExpanded}`);

                        // Always allow toggling if we have topic participation data
                        const hasTopicInParticipation = user.topicParticipation && user.topicParticipation[topicId];

                        console.log(`Topic participation for ${userId}:`, user.topicParticipation);
                        console.log(`Checking topic ${topicId} in participation:`, hasTopicInParticipation);
                        console.log(`Cached user data for messages:`, cachedUserDetails[userId]?.messages_by_topics?.map(t => ({
                          id: t.topic_id,
                          name: t.topic_name,
                          messageCount: t.message_count
                        })));

                        if (hasTopicInParticipation) {
                          // If already expanded, just collapse
                          if (isTopicExpanded) {
                            console.log(`Collapsing topic: ${topicNodeId}`);
                            toggleNode(topicNodeId);
                            return;
                          }

                          // Try to load user details if not cached
                          if (!cachedUserDetails[userId]) {
                            console.log(`Loading user details for first time: ${userId}`);
                            try {
                              await loadUserDetailsForMessages(userId);
                              // eslint-disable-next-line @typescript-eslint/no-unused-vars
                            } catch (err) {
                              console.log(`Failed to load user details, will show placeholder`);
                            }
                          }

                          // Expand the topic (either with real data or placeholder)
                          console.log(`Expanding topic: ${topicNodeId}`);
                          toggleNode(topicNodeId);
                        }
                      }}
                    >
                      {loadingUserDetails.has(userId) ? (
                        <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                      ) : (
                        isTopicExpanded ?
                          <ChevronDown className="w-4 h-4 text-gray-500" /> :
                          <ChevronRight className="w-4 h-4 text-gray-500" />
                      )}

                      <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                        <Hash className="w-3 h-3 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">Topic {topicId}</div>
                        <div className="text-xs text-gray-500">
                          {count as number} messages
                          {loadingUserDetails.has(userId) && (
                            <span className="text-gray-500"> • Loading...</span>
                          )}
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {count as number}
                      </Badge>
                    </div>
                  </div>

                  {isTopicExpanded && (
                    <div style={{ paddingLeft: "24px" }}>
                      {hasMessages ? (
                        <>
                          {topicMessages.slice(0, 5).map((message) => (
                            <div key={message.id} className="py-2 px-3">
                              <div className="bg-gray-50 dark:bg-gray-800 rounded p-3">
                                <div className="text-sm">{message.message}</div>
                                <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                                  <span>{new Date(message.timestamp).toLocaleString()}</span>
                                  {message.sentiment && (
                                    <Badge variant="outline" className="text-xs">
                                      {message.sentiment}
                                    </Badge>
                                  )}
                                  {message.conversationId && (
                                    <Badge variant="outline" className="text-xs">
                                      Conv: {message.conversationId}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                          {topicMessages.length > 5 && (
                            <div className="text-xs text-gray-500 px-3 py-1">
                              ... and {topicMessages.length - 5} more messages
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="py-2 px-3">
                          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded p-3 border-l-4 border-yellow-400">
                            <div className="text-sm text-yellow-800 dark:text-yellow-200">
                              📊 Topic Participation Data Available
                            </div>
                            <div className="text-xs text-yellow-600 dark:text-yellow-300 mt-1">
                              This user participated in <strong>{count as number} messages</strong> for this topic, but detailed message content is not available through the current API endpoint.
                            </div>
                            <div className="text-xs text-yellow-600 dark:text-yellow-300 mt-2">
                              💡 Data shows activity in {(() => {
                                const cachedUser = cachedUserDetails[userId];
                                const topicName = cachedUser?.messages_by_topics?.find(t => t.topic_id.toString() === topicId)?.topic_name;
                                return topicName ? `"${topicName}"` : `Topic ${topicId}`;
                              })()} - message details may be available through other analysis tools.
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

    // Render group topic analysis based on all users data
  const renderGroupTopicAnalysis = () => {
    if (!conversationData?.users) {
      return (
        <div className="text-center py-8 text-gray-500">
          No group data available. Click "Analyze Group" to load data.
        </div>
      );
    }

    // Aggregate topics from all users
    const topicMap = new Map<string, {
      id: string,
      name: string,
      totalMessages: number,
      userCount: number,
      users: string[]
    }>();

    // Process each user's topics
    Object.entries(conversationData.users).forEach(([userId, user]) => {
      if (user.topicParticipation) {
        Object.entries(user.topicParticipation).forEach(([topicId, messageCount]) => {
          const existing = topicMap.get(topicId);
          if (existing) {
            existing.totalMessages += messageCount as number;
            existing.userCount += 1;
            existing.users.push(user.name || userId);
          } else {
            // Try to get topic name from cached user data
            let topicName = `Topic ${topicId}`;
            for (const cachedUser of Object.values(cachedUserDetails)) {
              const topic = cachedUser?.messages_by_topics?.find(t => t.topic_id.toString() === topicId);
              if (topic?.topic_name) {
                topicName = topic.topic_name;
                break;
              }
            }

            topicMap.set(topicId, {
              id: topicId,
              name: topicName,
              totalMessages: messageCount as number,
              userCount: 1,
              users: [user.name || userId]
            });
          }
        });
      }
    });

    // Sort topics by total messages (descending)
    const sortedTopics = Array.from(topicMap.values())
      .sort((a, b) => b.totalMessages - a.totalMessages);

    if (sortedTopics.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          No topic participation data found in the group.
        </div>
      );
    }

    return sortedTopics.map((topic) => {
      const topicNodeId = `group_topic_${topic.id}`;
      const isExpanded = expandedNodes.has(topicNodeId);

      return (
        <div key={topic.id}>
          <div
            className="flex items-center gap-2 py-2 px-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded cursor-pointer"
            onClick={() => toggleNode(topicNodeId)}
          >
            {isExpanded ?
              <ChevronDown className="w-4 h-4 text-gray-500" /> :
              <ChevronRight className="w-4 h-4 text-gray-500" />
            }

            <div className="flex items-center gap-3 w-full">
              <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                <Hash className="w-3 h-3 text-blue-600" />
              </div>

              <div className="flex-1">
                <div className="font-medium text-sm">{topic.name}</div>
                <div className="text-xs text-gray-500">
                  {topic.totalMessages} messages • {topic.userCount} participants
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {topic.totalMessages}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Topic
                </Badge>
              </div>
            </div>
          </div>

          {isExpanded && (
            <div style={{ paddingLeft: "24px" }} className="py-2">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded p-3 border-l-4 border-blue-400">
                <div className="text-sm text-blue-800 dark:text-blue-200 font-medium mb-2">
                  📊 Topic Overview: {topic.name}
                </div>
                <div className="text-xs text-blue-600 dark:text-blue-300 space-y-1">
                  <div>📈 <strong>Total Messages:</strong> {topic.totalMessages}</div>
                  <div>👥 <strong>Active Participants:</strong> {topic.userCount}</div>
                  <div>
                    🗣️ <strong>Top Contributors:</strong> {topic.users.slice(0, 3).join(", ")}
                    {topic.users.length > 3 && ` and ${topic.users.length - 3} more`}
                  </div>
                </div>
                <div className="text-xs text-blue-600 dark:text-blue-300 mt-2 pt-2 border-t border-blue-200 dark:border-blue-700">
                  💡 Use "User Deep Dive" with a specific user ID to see detailed messages for this topic.
                </div>
              </div>
            </div>
          )}
        </div>
      );
    });
  };

  // Render user topics based on real user details data
  const renderUserTopics = () => {
    if (!userDetails?.messages_by_topics) {
      return (
        <div className="text-center py-8 text-gray-500">
          No topic data available. Try analyzing a specific user.
        </div>
      );
    }

    return userDetails.messages_by_topics.map((topic) => {
      const topicId = `topic_${topic.topic_id}`;
      const isExpanded = expandedNodes.has(topicId);
      const hasMessages = topic.messages && topic.messages.length > 0;

      return (
        <div key={topicId}>
          <div
            className="flex items-center gap-2 py-2 px-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded cursor-pointer"
            onClick={() => hasMessages && toggleNode(topicId)}
          >
            {hasMessages && (
              isExpanded ?
                <ChevronDown className="w-4 h-4 text-gray-500" /> :
                <ChevronRight className="w-4 h-4 text-gray-500" />
            )}

            <div className="flex items-center gap-3 w-full">
              <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                <Hash className="w-3 h-3 text-blue-600" />
              </div>

              <div className="flex-1">
                <div className="font-medium text-sm">{topic.topic_name}</div>
                <div className="text-xs text-gray-500">
                  {topic.message_count} messages
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {topic.message_count}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Topic
                </Badge>
              </div>
            </div>
          </div>

          {hasMessages && isExpanded && (
            <div style={{ paddingLeft: "24px" }}>
              {topic.messages.slice(0, 5).map((message) => (
                <div key={message.message_id} className="py-2 px-3">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded p-3">
                    <div className="text-sm">{message.content}</div>
                    <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                      <span>{new Date(message.timestamp).toLocaleString()}</span>
                      {message.sentiment && (
                        <Badge variant="outline" className="text-xs">
                          {message.sentiment}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {topic.messages.length > 5 && (
                <div className="text-xs text-gray-500 px-3 py-1">
                  ... and {topic.messages.length - 5} more messages
                </div>
              )}
            </div>
          )}
        </div>
      );
    });
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
                  {conversationData?.stats?.totalMessages ||
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
                  {conversationData?.stats?.totalTopics ||
                   userDetails?.messages_by_topics?.length ||
                   Object.keys(conversationData?.users?.[Object.keys(conversationData.users)[0]]?.topicParticipation || {}).length ||
                   0}
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
                  {conversationData?.stats?.activeConversations ||
                   userDetails?.total_conversations ||
                   userDetails?.unique_conversations_participated ||
                   0}
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
                  {conversationData?.stats?.totalUsers ||
                   Object.keys(conversationData?.users || {}).length ||
                   (userDetails ? 1 : 0)}
                </div>
                <div className="text-sm text-gray-600">Participants</div>
                    </div>
                  </div>
              </Card>
          </div>
      )}

      {/* Interactive Visualization */}
            <Card>
              <CardHeader>
          <CardTitle className="text-lg">Interactive Visualization</CardTitle>
          <CardDescription>Explore your data through different perspectives</CardDescription>
              </CardHeader>
              <CardContent>
          <Tabs defaultValue="conversation" onValueChange={(value) => setQueryType(value as "group" | "user")}>
            <TabsList className="w-full">
              <TabsTrigger value="conversation" className="w-full">Conversation Tree</TabsTrigger>
              <TabsTrigger value="topic" className="w-full">Topic Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="conversation" className="mt-6">
                <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    <span className="font-medium">Group: {groupId}</span>
                          </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setExpandedNodes(new Set())}
                  >
                    Collapse All
                  </Button>
                        </div>

                {conversationData && (
                  <div className="text-sm text-gray-600">
                    {conversationData.stats?.totalMessages || 0} messages • {Object.keys(conversationData.users || {}).length} users
                                </div>
                )}

                <div className="border rounded-lg max-h-96 overflow-y-auto">
                  {conversationData?.users ? (
                    Object.entries(conversationData.users).map(([userId, user]) =>
                      renderUserNode(userId, user)
                    )
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <Loader2 className="w-6 h-6 animate-spin mr-2" />
                          Loading conversation data...
                        </div>
                      ) : (
                        "No conversation data available. Click 'Analyze Group' to load data."
                      )}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="topic" className="mt-6">
              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Hash className="w-5 h-5" />
                    <span className="font-medium">
                      {queryType === "user" ? "User Topic Analysis" : "Group Topic Analysis"}
                    </span>
                    {queryType === "user" && userDetails && (
                      <Badge variant="outline">User: {userDetails.user_name || userId}</Badge>
                    )}
                    {queryType === "group" && conversationData && (
                      <Badge variant="outline">Group: {groupId}</Badge>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setExpandedNodes(new Set())}
                  >
                    Collapse All
                  </Button>
                </div>

                                {queryType === "user" && userDetails && (
                  <div className="text-sm text-gray-600">
                    Total Messages: {userDetails.total_messages || 0} •
                    Topics: {userDetails.messages_by_topics?.length || 0} •
                    Conversations: {userDetails.unique_conversations_participated || 0}
                  </div>
                )}

                {queryType === "group" && conversationData && (
                  <div className="text-sm text-gray-600">
                    Total Messages: {conversationData.stats?.totalMessages || 0} •
                    Active Topics: {(() => {
                      const topicSet = new Set<string>();
                      Object.values(conversationData.users || {}).forEach(user => {
                        if (user.topicParticipation) {
                          Object.keys(user.topicParticipation).forEach(topicId => topicSet.add(topicId));
                        }
                      });
                      return topicSet.size;
                    })()} •
                    Participants: {Object.keys(conversationData.users || {}).length}
                  </div>
                )}

                <div className="flex gap-4 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    <span>Topics</span>
                    </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-gray-500 rounded"></div>
                    <span>Messages</span>
                    </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span>Sentiment</span>
                  </div>
                </div>

                <div className="border rounded-lg max-h-96 overflow-y-auto">
                  {queryType === "user" ? (
                    renderUserTopics()
                  ) : (
                    renderGroupTopicAnalysis()
                  )}
                </div>
        </div>
            </TabsContent>
          </Tabs>
          </CardContent>
        </Card>
    </div>
  );
}
