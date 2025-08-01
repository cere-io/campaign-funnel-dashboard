"use client"

import type React from "react"

import { useState } from "react"
import { ChevronDown, ChevronRight, MessageSquare, Users, User, Hash, ArrowRight } from "lucide-react"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible"
import type { ConversationTreeData, ConversationNode } from "../lib/api"

interface TreeNode {
  id: string
  type: "topic" | "conversation" | "message"
  title: string
  subtitle?: string
  count?: number
  children?: TreeNode[]
  data?: any
  expanded?: boolean
}

interface ConversationTreeProps {
  data: ConversationTreeData
  queryType: "group" | "user"
}

export function ConversationTree({ data, queryType }: ConversationTreeProps) {
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

  const buildTreeStructure = (): TreeNode[] => {
    if (queryType === "user") {
      return buildUserTree()
    } else {
      return buildGroupTree()
    }
  }

  const buildUserTree = (): TreeNode[] => {
    // For user mode, use conversations data if available
    const conversations = data.conversations || []
    if (conversations.length === 0) {
      return []
    }

    const topicMap = new Map<string, ConversationNode[]>()

    conversations.forEach((message) => {
      if (!topicMap.has(message.topic)) {
        topicMap.set(message.topic, [])
      }
      topicMap.get(message.topic)!.push(message)
    })

    return Array.from(topicMap.entries()).map(([topicName, messages]) => {
      const conversationMap = new Map<string, ConversationNode[]>()

      messages.forEach((message) => {
        const convId = message.conversationId || "unknown"
        if (!conversationMap.has(convId)) {
          conversationMap.set(convId, [])
        }
        conversationMap.get(convId)!.push(message)
      })

      const conversationNodes: TreeNode[] = Array.from(conversationMap.entries()).map(([convId, convMessages]) => {
        const sortedMessages = convMessages.sort(
          (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
        )

        const messageNodes: TreeNode[] = sortedMessages.map((message, index) => ({
          id: `message-${message.id}`,
          type: "message",
          title: message.message,
          subtitle: `${message.user} • ${new Date(message.timestamp).toLocaleString()}`,
          data: { ...message, messageIndex: index + 1 },
        }))

        return {
          id: `conversation-${convId}`,
          type: "conversation",
          title: `Conversation ${convId.split("_").pop()?.substring(0, 8) || "Unknown"}`,
          subtitle: `${convMessages.length} messages • ${new Date(sortedMessages[0].timestamp).toLocaleDateString()}`,
          count: convMessages.length,
          children: messageNodes,
          data: { conversationId: convId, messages: sortedMessages },
        }
      })

      return {
        id: `topic-${topicName}`,
        type: "topic",
        title: `Topic ${topicName}`,
        subtitle: `${messages.length} messages across ${conversationNodes.length} conversations`,
        count: messages.length,
        children: conversationNodes,
        data: { topicName, totalMessages: messages.length },
      }
    })
  }

  const buildGroupTree = (): TreeNode[] => {
    // For group mode, use the users data structure
    if (!data.users) {
      return []
    }

    const userEntries = Object.entries(data.users)

    // Sort users by message count (descending - most messages first)
    const sortedUserEntries = userEntries.sort((a, b) => {
      const aCount = a[1].messageIds?.length || 0
      const bCount = b[1].messageIds?.length || 0
      return bCount - aCount
    })

    return sortedUserEntries.map(([userId, user]) => {
      // Get all messages for this user from conversations
      const conversations = data.conversations || []
      const userMessages = conversations.filter(
        conv => conv.user === user.name && user.messageIds?.includes(parseInt(conv.id))
      )

      // Group messages by topic name
      const topicMap = new Map<string, ConversationNode[]>()
      userMessages.forEach(message => {
        if (!topicMap.has(message.topic)) {
          topicMap.set(message.topic, [])
        }
        topicMap.get(message.topic)!.push(message)
      })

      // Sort topics by message count (descending)
      const sortedTopicEntries = Array.from(topicMap.entries()).sort((a, b) => b[1].length - a[1].length)

      const topicNodes: TreeNode[] = sortedTopicEntries.map(([topicName, topicMessages]) => {

        const sortedMessages = topicMessages.sort(
          (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
        )

        const messageNodes: TreeNode[] = sortedMessages.map((message, index) => ({
          id: `message-${message.id}`,
          type: "message",
          title: message.message,
          subtitle: new Date(message.timestamp).toLocaleString(),
          data: { ...message, messageIndex: index + 1 },
        }))

        return {
          id: `topic-${userId}-${topicName.replace(/\s+/g, '-')}`,
          type: "topic",
          title: topicName,
          subtitle: `${topicMessages.length} messages`,
          count: topicMessages.length,
          children: messageNodes.length > 0 ? messageNodes : undefined,
          data: { topicName, user: userId, messages: sortedMessages },
        }
      })

      return {
        id: `user-${userId}`,
        type: "conversation",
        title: user.name || `User ${userId}`,
        subtitle: `${user.messageIds?.length || 0} messages across ${topicNodes.length} topics`,
        count: user.messageIds?.length || 0,
        children: topicNodes,
        data: { userName: user.name || userId, userId, totalMessages: user.messageIds?.length || 0 },
      }
    })
  }

  const renderTreeNode = (node: TreeNode, depth = 0): React.ReactNode => {
    const isExpanded = expandedNodes.has(node.id)
    const hasChildren = node.children && node.children.length > 0
    const indentClass = depth > 0 ? `ml-${Math.min(depth * 4, 16)} sm:ml-${Math.min(depth * 6, 24)}` : ""

    const getNodeIcon = () => {
      switch (node.type) {
        case "topic":
          return <Hash className="w-4 h-4" />
        case "conversation":
          return queryType === "group" ? <User className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />
        case "message":
          return <ArrowRight className="w-4 h-4" />
        default:
          return <MessageSquare className="w-4 h-4" />
      }
    }

    const getNodeGradient = () => {
      switch (node.type) {
        case "topic":
          return "from-blue-500 to-indigo-600"
        case "conversation":
          return "from-emerald-500 to-teal-600"
        case "message":
          return "from-slate-400 to-slate-500"
        default:
          return "from-slate-400 to-slate-500"
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
            className="text-xs ml-2 rounded-full"
          >
            {node.data.sentiment}
          </Badge>
        )
      }
      return null
    }

    return (
      <div key={node.id} className={`${indentClass}`}>
        <Collapsible open={isExpanded} onOpenChange={() => hasChildren && toggleNode(node.id)}>
          <div className={`relative group`}>
            <div
              className={`absolute left-0 top-0 bottom-0 w-0.5 sm:w-1 bg-gradient-to-b ${getNodeGradient()} rounded-full opacity-60`}
            />
            <div className="pl-3 sm:pl-6 py-2 sm:py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all duration-200 rounded-lg ml-1 sm:ml-2">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-start p-0 h-auto font-normal" disabled={!hasChildren}>
                  <div className="flex items-center gap-2 sm:gap-3 w-full">
                    {hasChildren ? (
                      <div className="p-0.5 sm:p-1 rounded-md bg-slate-100 dark:bg-slate-700 group-hover:bg-slate-200 dark:group-hover:bg-slate-600 transition-colors">
                        {isExpanded ? (
                          <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-slate-600 dark:text-slate-400" />
                        ) : (
                          <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-slate-600 dark:text-slate-400" />
                        )}
                      </div>
                    ) : (
                      <div className="w-4 h-4 sm:w-6 sm:h-6 flex-shrink-0" />
                    )}
                    <div className={`p-1.5 sm:p-2 rounded-lg bg-gradient-to-r ${getNodeGradient()}`}>
                      <div className="text-white">{getNodeIcon()}</div>
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                        <span className="font-medium text-slate-900 dark:text-slate-100 text-sm sm:text-base truncate">
                          {node.title}
                        </span>
                        {node.count && (
                          <Badge
                            variant="secondary"
                            className="text-xs bg-slate-100 dark:bg-slate-700 rounded-full flex-shrink-0"
                          >
                            {node.count}
                          </Badge>
                        )}
                        {getSentimentBadge()}
                      </div>
                      {node.subtitle && (
                        <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 truncate">
                          {node.subtitle}
                        </div>
                      )}
                    </div>
                  </div>
                </Button>
              </CollapsibleTrigger>
            </div>
          </div>

          {hasChildren && (
            <CollapsibleContent className="space-y-1 mt-1 sm:mt-2">
              {node.children!.map((child) => renderTreeNode(child, depth + 1))}
            </CollapsibleContent>
          )}
        </Collapsible>
      </div>
    )
  }

  const treeStructure = buildTreeStructure()

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-col xs:flex-row xs:items-center gap-2 sm:gap-3">
          <Badge
            variant="outline"
            className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 w-fit text-xs sm:text-sm"
          >
            {queryType === "user" ? (
              <>
                <User className="w-3 h-3 mr-1" />
                User Analysis
              </>
            ) : (
              <>
                <Users className="w-3 h-3 mr-1" />
                Group Analysis
              </>
            )}
          </Badge>
          <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            {data.conversations?.length || 0} messages • {treeStructure.length} top-level nodes
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (expandedNodes.size > 0) {
              setExpandedNodes(new Set())
            } else {
              const allNodeIds = new Set<string>()
              const collectNodeIds = (nodes: TreeNode[]) => {
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
          className="rounded-lg text-xs sm:text-sm w-fit"
        >
          {expandedNodes.size > 0 ? "Collapse All" : "Expand All"}
        </Button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-2 sm:p-4">
        <div className="space-y-1 sm:space-y-2 max-h-64 sm:max-h-96 overflow-y-auto">
          {treeStructure.length > 0 ? (
            treeStructure.map((node) => renderTreeNode(node))
          ) : (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              No data available. Please analyze a group or user to see conversation structure.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
