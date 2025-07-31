"use client"

import { useState, useMemo } from "react"
import { Hash, TrendingUp, MessageSquare, Users, Eye, EyeOff } from "lucide-react"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Progress } from "./ui/progress"
import type { ConversationNode, ConversationTreeData } from "../lib/api"

interface TopicAnalysis {
  topic: string
  messageCount: number
  uniqueUsers: number
  dominantSentiment: string
  sentimentDistribution: Record<string, number>
  timespan: { start: string; end: string }
  keywords: string[]
  conversations: ConversationNode[]
}

interface TopicTreeProps {
  data: ConversationTreeData
  queryType: "group" | "user"
}

export function TopicTree({ data, queryType }: TopicTreeProps) {

  const [showDetails, setShowDetails] = useState<Record<string, boolean>>({})

  const toggleDetails = (topic: string) => {
    setShowDetails(prev => ({
      ...prev,
      [topic]: !prev[topic]
    }))
  }

  // Analyze topics from conversation data
  const topicAnalysis = useMemo((): TopicAnalysis[] => {
    if (!data.conversations || data.conversations.length === 0) return []

    const topicMap = new Map<string, ConversationNode[]>()
    
    // Group messages by topic
    data.conversations.forEach(conv => {
      const topic = conv.topic || "Unknown Topic"
      if (!topicMap.has(topic)) {
        topicMap.set(topic, [])
      }
      topicMap.get(topic)!.push(conv)
    })

    // Analyze each topic
    const analysis: TopicAnalysis[] = Array.from(topicMap.entries()).map(([topic, messages]) => {
      // Calculate sentiment distribution
      const sentimentCounts = messages.reduce((acc, msg) => {
        const sentiment = msg.sentiment || "neutral"
        acc[sentiment] = (acc[sentiment] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      // Find dominant sentiment
      const dominantSentiment = Object.entries(sentimentCounts).reduce((a, b) => 
        sentimentCounts[a[0]] > sentimentCounts[b[0]] ? a : b
      )[0] || "neutral"

      // Get unique users
      const uniqueUsers = new Set(messages.map(m => m.user)).size

      // Get timespan
      const timestamps = messages.map(m => new Date(m.timestamp).getTime()).sort()
      const timespan = {
        start: new Date(timestamps[0]).toISOString(),
        end: new Date(timestamps[timestamps.length - 1]).toISOString()
      }

      // Extract keywords (simple implementation - most common words)
      const allText = messages.map(m => m.message).join(' ').toLowerCase()
      const words = allText.match(/\b\w{4,}\b/g) || []
      const wordCounts = words.reduce((acc, word) => {
        if (!['this', 'that', 'with', 'have', 'they', 'been', 'from', 'will', 'more', 'like', 'just', 'what', 'when', 'where', 'your'].includes(word)) {
          acc[word] = (acc[word] || 0) + 1
        }
        return acc
      }, {} as Record<string, number>)
      
      const keywords = Object.entries(wordCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([word]) => word)

      return {
        topic,
        messageCount: messages.length,
        uniqueUsers,
        dominantSentiment,
        sentimentDistribution: sentimentCounts,
        timespan,
        keywords,
        conversations: messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      }
    })

    // Sort by message count descending
    return analysis.sort((a, b) => b.messageCount - a.messageCount)
  }, [data.conversations])

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case 'positive': return 'text-green-600 bg-green-50 dark:bg-green-900/20'
      case 'negative': return 'text-red-600 bg-red-50 dark:bg-red-900/20'
      case 'neutral': return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20'
      default: return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20'
    }
  }

  const renderSentimentDistribution = (distribution: Record<string, number>, total: number) => {
    return (
      <div className="space-y-2">
        {Object.entries(distribution).map(([sentiment, count]) => {
          const percentage = (count / total) * 100
          return (
            <div key={sentiment} className="flex items-center space-x-2">
              <span className="text-xs font-medium w-16 capitalize">{sentiment}</span>
              <Progress value={percentage} className="flex-1 h-2" />
              <span className="text-xs text-gray-500 w-12">{count}</span>
            </div>
          )
        })}
      </div>
    )
  }

  if (topicAnalysis.length === 0) {
    return (
      <Card>
        <CardContent className="p-4 sm:p-8 text-center">
          <Hash className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-2">No Topics Found</h3>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
            No topic data available for analysis.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 space-y-2 sm:space-y-0">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Topic Analysis</h3>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            {queryType === "group" ? `Group ${data.queryId}` : `User ${data.queryId}`}
            {data.userName && ` (${data.userName})`} • {topicAnalysis.length} topics identified
          </p>
        </div>
        <Badge variant="outline" className="flex items-center space-x-1 w-fit">
          <TrendingUp className="w-3 h-3" />
          <span className="text-xs">{data.conversations?.length || 0} total messages</span>
        </Badge>
      </div>

      <div className="grid gap-4">
        {topicAnalysis.map((analysis) => (
          <Card key={analysis.topic} className="relative">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <Hash className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-base sm:text-lg truncate">{analysis.topic}</CardTitle>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                      <span className="flex items-center space-x-1">
                        <MessageSquare className="w-3 h-3" />
                        <span>{analysis.messageCount} messages</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Users className="w-3 h-3" />
                        <span>{analysis.uniqueUsers} participants</span>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 self-start sm:self-center">
                  <Badge className={`${getSentimentColor(analysis.dominantSentiment)} text-xs`}>
                    {analysis.dominantSentiment}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleDetails(analysis.topic)}
                  >
                    {showDetails[analysis.topic] ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>

            {showDetails[analysis.topic] && (
              <CardContent className="pt-0 space-y-4">
                {/* Keywords */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Key Terms</h4>
                  <div className="flex flex-wrap gap-1">
                    {analysis.keywords.map((keyword, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Sentiment Distribution */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Sentiment Distribution</h4>
                  {renderSentimentDistribution(analysis.sentimentDistribution, analysis.messageCount)}
                </div>

                {/* Timespan */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Activity Period</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(analysis.timespan.start).toLocaleString()} - {new Date(analysis.timespan.end).toLocaleString()}
                  </p>
                </div>

                {/* Recent Messages Sample */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Recent Messages</h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {analysis.conversations.slice(-3).map((conv) => (
                      <div key={conv.id} className="text-xs p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium">{conv.user}</span>
                          <span className="text-gray-500">
                            {new Date(conv.timestamp).toLocaleTimeString()}
                          </span>
                          {conv.sentiment && (
                            <Badge variant="outline" className="text-xs">
                              {conv.sentiment}
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-700 dark:text-gray-300">
                          {conv.message.length > 100 ? `${conv.message.slice(0, 100)}...` : conv.message}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}