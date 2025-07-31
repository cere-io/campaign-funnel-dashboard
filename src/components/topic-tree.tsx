"use client"

import type React from "react"

import { useState } from "react"
import { ChevronDown, ChevronRight, Hash, MessageSquare, User, Tag, ArrowRight } from "lucide-react"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible"
import type { ConversationTreeData, ConversationNode } from "../lib/api"

interface TopicTreeNode {
  id: string
  type: "topic" | "subject" | "conversation" | "message"
  title: string
  subtitle?: string
  count?: number
  children?: TopicTreeNode[]
  data?: any
  expanded?: boolean
}

interface TopicTreeProps {
  data: ConversationTreeData
  queryType: "group" | "user"
}

export function TopicTree({ data, queryType }: TopicTreeProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes)
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId)
    } else {
      newExpanded.add(nodeId)
    }
    setExpandedNodes(newExpanded)
  }

  // Function to extract subjects/subtopics from messages
  const extractSubjects = (messages: ConversationNode[]): Map<string, ConversationNode[]> => {
    const subjectMap = new Map<string, ConversationNode[]>()

    messages.forEach((message) => {
      // Extract potential subjects from message content
      const subjects = extractSubjectsFromContent(message.message)

      if (subjects.length === 0) {
        // If no specific subjects found, categorize by conversation or general content
        const subject = categorizeMessage(message)
        if (!subjectMap.has(subject)) {
          subjectMap.set(subject, [])
        }
        subjectMap.get(subject)!.push(message)
      } else {
        // Assign message to all relevant subjects
        subjects.forEach((subject) => {
          if (!subjectMap.has(subject)) {
            subjectMap.set(subject, [])
          }
          subjectMap.get(subject)!.push(message)
        })
      }
    })

    return subjectMap
  }

  // Extract subjects from message content using keywords and patterns
  const extractSubjectsFromContent = (content: string): string[] => {
    const subjects: string[] = []

    // Define subject patterns and keywords
    const subjectPatterns = [
      { pattern: /\b(greet|hello|hi|gm|good morning|hey)\b/i, subject: "Greetings" },
      { pattern: /\b(question|ask|help|how|what|why|when|where)\b/i, subject: "Questions & Help" },
      { pattern: /\b(thank|thanks|appreciate|grateful)\b/i, subject: "Appreciation" },
      { pattern: /\b(interesting|cool|awesome|great|nice|good)\b/i, subject: "Positive Reactions" },
      { pattern: /\b(problem|issue|error|bug|wrong)\b/i, subject: "Issues & Problems" },
      { pattern: /\b(invite|join|friend|connect)\b/i, subject: "Invitations & Connections" },
      { pattern: /\b(update|news|announcement|info)\b/i, subject: "Updates & News" },
      { pattern: /\b(need|want|require|request)\b/i, subject: "Requests & Needs" },
      { pattern: /\b(curious|wonder|think|believe|opinion)\b/i, subject: "Thoughts & Opinions" },
      { pattern: /😀|😊|😄|😃|🙂|😉|😎/g, subject: "Positive Emotions" },
      { pattern: /😢|😞|😔|😟|😕|😰/g, subject: "Negative Emotions" },
      { pattern: /👀|🤔|💭|🧐/g, subject: "Curiosity & Observation" },
      { pattern: /🎉|🎊|🥳|✨|🌟/g, subject: "Celebrations" },
    ]

    // Check for patterns
    subjectPatterns.forEach(({ pattern, subject }) => {
      if (pattern.test(content)) {
        subjects.push(subject)
      }
    })

    // If message is very short, categorize as "Brief Messages"
    if (content.length <= 10 && subjects.length === 0) {
      subjects.push("Brief Messages")
    }

    return subjects
  }

  // Categorize message when no specific subjects are found
  const categorizeMessage = (message: ConversationNode): string => {
    const content = message.message.toLowerCase()

    if (content.length <= 10) return "Brief Messages"
    if (content.includes("?")) return "Questions"
    if (message.sentiment === "positive") return "Positive Messages"
    if (message.sentiment === "negative") return "Negative Messages"
    if (message.conversationId)
      return `Conversation ${message.conversationId.split("_").pop()?.substring(0, 8) || "Unknown"}`

    return "General Discussion"
  }

  const buildTopicTree = (): TopicTreeNode[] => {
    // For group mode, use users data to build comprehensive topic analysis
    if (queryType === "group" && data.users) {
      return buildGroupTopicTree()
    }

    // For user mode or fallback, use conversations data
    const conversations = data.conversations || []
    if (conversations.length === 0) {
      return []
    }

    const topicMap = new Map<string, ConversationNode[]>()

    // Group messages by topic
    conversations.forEach((message) => {
      if (!topicMap.has(message.topic)) {
        topicMap.set(message.topic, [])
      }
      topicMap.get(message.topic)!.push(message)
    })

    // Sort topics by message count (descending - most messages first)
    const sortedTopicEntries = Array.from(topicMap.entries()).sort((a, b) => b[1].length - a[1].length)

    // Build topic nodes
    return sortedTopicEntries.map(([topicName, messages]) => {
      // Extract subjects within this topic
      const subjectMap = extractSubjects(messages)

      // Sort subjects by message count (descending)
      const sortedSubjectEntries = Array.from(subjectMap.entries()).sort((a, b) => b[1].length - a[1].length)

      // Build subject nodes
      const subjectNodes: TopicTreeNode[] = sortedSubjectEntries.map(([subjectName, subjectMessages]) => {
        // Group messages by conversation within each subject
        const conversationMap = new Map<string, ConversationNode[]>()

        subjectMessages.forEach((message) => {
          const convId = message.conversationId || "standalone"
          if (!conversationMap.has(convId)) {
            conversationMap.set(convId, [])
          }
          conversationMap.get(convId)!.push(message)
        })

        // Sort conversations by message count (descending)
        const sortedConversationEntries = Array.from(conversationMap.entries()).sort(
          (a, b) => b[1].length - a[1].length,
        )

        // Build conversation nodes for this subject
        const conversationNodes: TopicTreeNode[] = sortedConversationEntries.map(([convId, convMessages]) => {
          // Sort messages by timestamp
          const sortedMessages = convMessages.sort(
            (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
          )

          const messageNodes: TopicTreeNode[] = sortedMessages.map((message, index) => ({
            id: `message-${message.id}-${subjectName}`,
            type: "message",
            title: message.message,
            subtitle: `${message.user} • ${new Date(message.timestamp).toLocaleString()}`,
            data: { ...message, messageIndex: index + 1, subject: subjectName },
          }))

          return {
            id: `conversation-${convId}-${subjectName}`,
            type: "conversation",
            title:
              convId === "standalone"
                ? "Standalone Messages"
                : `Conversation ${convId.split("_").pop()?.substring(0, 8) || "Unknown"}`,
            subtitle: `${convMessages.length} messages • ${sortedMessages
              .map((m) => m.user)
              .filter((u, i, arr) => arr.indexOf(u) === i)
              .join(", ")}`,
            count: convMessages.length,
            children: messageNodes,
            data: { conversationId: convId, messages: sortedMessages, subject: subjectName },
          }
        })

        return {
          id: `subject-${topicName}-${subjectName}`,
          type: "subject",
          title: subjectName,
          subtitle: `${subjectMessages.length} messages across ${conversationNodes.length} ${conversationNodes.length === 1 ? "conversation" : "conversations"}`,
          count: subjectMessages.length,
          children: conversationNodes,
          data: { subjectName, topicName, messages: subjectMessages },
        }
      })

      return {
        id: `topic-${topicName}`,
        type: "topic",
        title: `Topic ${topicName}`,
        subtitle: `${messages.length} messages • ${subjectNodes.length} subjects • ${new Set(messages.map((m) => m.user)).size} participants`,
        count: messages.length,
        children: subjectNodes,
        data: {
          topicName,
          totalMessages: messages.length,
          subjects: subjectNodes.length,
          participants: Array.from(new Set(messages.map((m) => m.user))),
        },
      }
    })
  }

  const buildGroupTopicTree = (): TopicTreeNode[] => {
    if (!data.users || !data.conversations) return []

    // Group messages by topic name (use actual conversation data)
    const topicMap = new Map<string, ConversationNode[]>()
    data.conversations.forEach((message) => {
      if (!topicMap.has(message.topic)) {
        topicMap.set(message.topic, [])
      }
      topicMap.get(message.topic)!.push(message)
    })

    // Sort topics by message count (descending)
    const sortedTopicEntries = Array.from(topicMap.entries()).sort((a, b) => b[1].length - a[1].length)

    return sortedTopicEntries.map(([topicName, messages]) => {
      // Extract subjects within this topic
      const subjectMap = extractSubjects(messages)

      // Sort subjects by message count (descending)
      const sortedSubjectEntries = Array.from(subjectMap.entries()).sort((a, b) => b[1].length - a[1].length)

      // Build subject nodes
      const subjectNodes: TopicTreeNode[] = sortedSubjectEntries.map(([subjectName, subjectMessages]) => {
        // Group messages by conversation within each subject
        const conversationMap = new Map<string, ConversationNode[]>()

        subjectMessages.forEach((message) => {
          const convId = message.conversationId || "standalone"
          if (!conversationMap.has(convId)) {
            conversationMap.set(convId, [])
          }
          conversationMap.get(convId)!.push(message)
        })

        // Sort conversations by message count (descending)
        const sortedConversationEntries = Array.from(conversationMap.entries()).sort(
          (a, b) => b[1].length - a[1].length,
        )

        // Build conversation nodes for this subject
        const conversationNodes: TopicTreeNode[] = sortedConversationEntries.map(([convId, convMessages]) => {
          // Sort messages by timestamp
          const sortedMessages = convMessages.sort(
            (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
          )

          const messageNodes: TopicTreeNode[] = sortedMessages.map((message, index) => ({
            id: `message-${message.id}-${subjectName}`,
            type: "message",
            title: message.message,
            subtitle: `${message.user} • ${new Date(message.timestamp).toLocaleString()}`,
            data: { ...message, messageIndex: index + 1, subject: subjectName },
          }))

          return {
            id: `conversation-${convId}-${subjectName}`,
            type: "conversation",
            title:
              convId === "standalone"
                ? "Standalone Messages"
                : `Conversation ${convId.split("_").pop()?.substring(0, 8) || "Unknown"}`,
            subtitle: `${convMessages.length} messages • ${sortedMessages
              .map((m) => m.user)
              .filter((u, i, arr) => arr.indexOf(u) === i)
              .join(", ")}`,
            count: convMessages.length,
            children: messageNodes,
            data: { conversationId: convId, messages: sortedMessages, subject: subjectName },
          }
        })

        return {
          id: `subject-${topicName}-${subjectName}`,
          type: "subject",
          title: subjectName,
          subtitle: `${subjectMessages.length} messages across ${conversationNodes.length} ${conversationNodes.length === 1 ? "conversation" : "conversations"}`,
          count: subjectMessages.length,
          children: conversationNodes,
          data: { subjectName, messages: subjectMessages },
        }
      })

      return {
        id: `topic-${topicName}`,
        type: "topic",
        title: topicName,
        subtitle: `${messages.length} messages • ${subjectNodes.length} subjects • ${new Set(messages.map((m) => m.user)).size} participants`,
        count: messages.length,
        children: subjectNodes,
        data: {
          topicName,
          totalMessages: messages.length,
          subjects: subjectNodes.length,
          participants: Array.from(new Set(messages.map((m) => m.user))),
        },
      }
    })
  }

  const renderTreeNode = (node: TopicTreeNode, depth = 0): React.ReactNode => {
    const isExpanded = expandedNodes.has(node.id)
    const hasChildren = node.children && node.children.length > 0
    const indentClass = depth > 0 ? `ml-${Math.min(depth * 4, 16)}` : ""

    const getNodeIcon = () => {
      switch (node.type) {
        case "topic":
          return <Hash className="w-4 h-4" />
        case "subject":
          return <Tag className="w-4 h-4" />
        case "conversation":
          return <MessageSquare className="w-4 h-4" />
        case "message":
          return <ArrowRight className="w-4 h-4" />
        default:
          return <MessageSquare className="w-4 h-4" />
      }
    }

    const getNodeColor = () => {
      switch (node.type) {
        case "topic":
          return "border-l-purple-500"
        case "subject":
          return "border-l-blue-500"
        case "conversation":
          return "border-l-green-500"
        case "message":
          return "border-l-gray-400"
        default:
          return "border-l-gray-400"
      }
    }

    const getSentimentBadge = () => {
      if (node.type === "message" && node.data?.sentiment) {
    return (
          <Badge
            variant={
              node.data.sentiment === "positive"
                ? "default"
                : node.data.sentiment === "negative"
                  ? "destructive"
                  : "outline"
            }
            className="text-xs ml-2"
          >
            {node.data.sentiment}
          </Badge>
        )
      }
      return null
    }

    const getTypeIcon = () => {
      switch (node.type) {
        case "topic":
          return (
            <Badge variant="secondary" className="text-xs ml-2">
              Topic
            </Badge>
          )
        case "subject":
          return (
            <Badge variant="outline" className="text-xs ml-2">
              Subject
            </Badge>
          )
        case "conversation":
    return (
            <Badge variant="default" className="text-xs ml-2">
              Conv
            </Badge>
          )
        default:
          return null
      }
  }

  return (
      <div key={node.id} className={`${indentClass}`}>
        <Collapsible open={isExpanded} onOpenChange={() => hasChildren && toggleNode(node.id)}>
          <div
            className={`border-l-4 ${getNodeColor()} pl-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors`}
          >
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-start p-0 h-auto font-normal" disabled={!hasChildren}>
                <div className="flex items-center gap-2 w-full">
                  {hasChildren ? (
                    isExpanded ? (
                      <ChevronDown className="w-4 h-4 flex-shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 flex-shrink-0" />
                    )
                  ) : (
                    <div className="w-4 h-4 flex-shrink-0" />
                  )}
                  {getNodeIcon()}
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{node.title}</span>
                      {node.count && (
                        <Badge variant="secondary" className="text-xs">
                          {node.count}
        </Badge>
                      )}
                      {getTypeIcon()}
                      {getSentimentBadge()}
                    </div>
                    {node.subtitle && <div className="text-sm text-muted-foreground mt-1">{node.subtitle}</div>}
                  </div>
                </div>
              </Button>
            </CollapsibleTrigger>
          </div>

          {hasChildren && (
            <CollapsibleContent className="space-y-1">
              {node.children!.map((child) => renderTreeNode(child, depth + 1))}
            </CollapsibleContent>
          )}
        </Collapsible>
      </div>
    )
  }

  const treeStructure = buildTopicTree()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Hash className="w-5 h-5" />
          Topic-Subject Tree View
          <Badge variant="outline" className="ml-2">
            {queryType === "user" ? (
              <>
                <User className="w-3 h-3 mr-1" />
                User Analysis
              </>
            ) : (
              <>
                <MessageSquare className="w-3 h-3 mr-1" />
                Group Analysis
              </>
            )}
                  </Badge>
        </CardTitle>
        <div className="flex gap-4 text-sm text-muted-foreground flex-wrap">
          <span>Total Messages: {data.conversations?.length || 0}</span>
          <span>Topics: {treeStructure.length}</span>
          <span>Total Subjects: {treeStructure.reduce((acc, topic) => acc + (topic.children?.length || 0), 0)}</span>
                  <Button
            variant="outline"
                    size="sm"
            onClick={() => {
              if (expandedNodes.size > 0) {
                setExpandedNodes(new Set())
              } else {
                const allNodeIds = new Set<string>()
                const collectNodeIds = (nodes: TopicTreeNode[]) => {
                  nodes.forEach((node) => {
                    if (node.children && node.children.length > 0) {
                      allNodeIds.add(node.id)
                      collectNodeIds(node.children)
                    }
                  })
                }
                collectNodeIds(treeStructure)
                setExpandedNodes(allNodeIds)
              }
            }}
          >
            {expandedNodes.size > 0 ? "Collapse All" : "Expand All"}
                  </Button>
                </div>
        <div className="text-sm text-muted-foreground">
          <div className="flex gap-4 flex-wrap">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 border-l-4 border-l-purple-500"></div>
              <span>Topics</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 border-l-4 border-l-blue-500"></div>
              <span>Subjects</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 border-l-4 border-l-green-500"></div>
              <span>Conversations</span>
              </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 border-l-4 border-l-gray-400"></div>
              <span>Messages</span>
                  </div>
                </div>
                </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1 max-h-96 overflow-y-auto">
          {treeStructure.length > 0 ? (
            treeStructure.map((node) => renderTreeNode(node))
          ) : (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              No data available. Please analyze a group or user to see topic structure.
                </div>
          )}
                </div>
              </CardContent>
          </Card>
  )
}
