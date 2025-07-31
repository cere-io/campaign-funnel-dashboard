"use client"

import React, { useState } from "react"
import { ChevronDown, ChevronRight, MessageSquare, User, Hash } from "lucide-react"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { Card, CardContent } from "./ui/card"
import type { ConversationNode, ConversationTreeData } from "../lib/api"

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

  // Build tree structure from conversation data
  const buildTreeStructure = (conversations: ConversationNode[]): TreeNode[] => {
    if (!conversations || conversations.length === 0) return []

    // Group by topic first
    const topicGroups = conversations.reduce((acc, conv) => {
      const topic = conv.topic || "Unknown Topic"
      if (!acc[topic]) {
        acc[topic] = []
      }
      acc[topic].push(conv)
      return acc
    }, {} as Record<string, ConversationNode[]>)

    return Object.entries(topicGroups).map(([topic, convs]) => {
      // Group conversations by conversationId within each topic
      const conversationGroups = convs.reduce((acc, conv) => {
        const convId = conv.conversationId || `single-${conv.id}`
        if (!acc[convId]) {
          acc[convId] = []
        }
        acc[convId].push(conv)
        return acc
      }, {} as Record<string, ConversationNode[]>)

      const conversationNodes: TreeNode[] = Object.entries(conversationGroups).map(([convId, messages]) => {
        const messageNodes: TreeNode[] = messages
          .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
          .map((msg) => ({
            id: `message-${msg.id}`,
            type: "message" as const,
            title: msg.message.length > 60 ? `${msg.message.slice(0, 60)}...` : msg.message,
            subtitle: `${msg.user} • ${new Date(msg.timestamp).toLocaleString()}`,
            data: msg,
          }))

        return {
          id: `conversation-${convId}`,
          type: "conversation" as const,
          title: `Conversation ${convId}`,
          subtitle: `${messages.length} messages`,
          count: messages.length,
          children: messageNodes,
          data: { conversationId: convId, messages },
        }
      })

      return {
        id: `topic-${topic}`,
        type: "topic" as const,
        title: topic,
        subtitle: `${convs.length} messages, ${conversationGroups ? Object.keys(conversationGroups).length : 0} conversations`,
        count: convs.length,
        children: conversationNodes,
        data: { topic, conversations: convs },
      }
    })
  }

  const renderTreeNode = (node: TreeNode, level: number = 0): React.ReactNode => {
    const isExpanded = expandedNodes.has(node.id)
    const hasChildren = node.children && node.children.length > 0

    const getIcon = () => {
      switch (node.type) {
        case "topic":
          return <Hash className="w-4 h-4 text-blue-500" />
        case "conversation":
          return <MessageSquare className="w-4 h-4 text-green-500" />
        case "message":
          return <User className="w-4 h-4 text-purple-500" />
        default:
          return null
      }
    }

    const getBadgeColor = () => {
      switch (node.type) {
        case "topic":
          return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
        case "conversation":
          return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
        case "message":
          return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
        default:
          return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
      }
    }

    return (
      <div key={node.id} className="w-full">
        <div
          className={`flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors ${
            level > 0 ? `ml-${Math.min(level * 4, 12)}` : ""
          }`}
          onClick={() => hasChildren && toggleNode(node.id)}
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-500" />
            )
          ) : (
            <div className="w-4 h-4" />
          )}

          {getIcon()}

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-900 dark:text-white truncate">{node.title}</span>
              {node.count && (
                <Badge className={`text-xs ${getBadgeColor()}`}>
                  {node.count}
                </Badge>
              )}
            </div>
            {node.subtitle && (
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{node.subtitle}</p>
            )}
          </div>

          {node.type === "message" && node.data?.sentiment && (
            <Badge variant="outline" className="text-xs">
              {node.data.sentiment}
            </Badge>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div className="mt-1 space-y-1">
            {node.children?.map((child) => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  const treeStructure = buildTreeStructure(data.conversations || [])

  if (!data.conversations || data.conversations.length === 0) {
    return (
      <Card>
        <CardContent className="p-4 sm:p-8 text-center">
          <MessageSquare className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-2">No Conversations Found</h3>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
            {queryType === "group" 
              ? "No conversations found for this group." 
              : "No conversations found for this user."
            }
          </p>
        </CardContent>
      </Card>
    )
  }

      return (
      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 space-y-2 sm:space-y-0">
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Conversation Tree</h3>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              {queryType === "group" ? `Group ${data.queryId}` : `User ${data.queryId}`}
              {data.userName && ` (${data.userName})`}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setExpandedNodes(expandedNodes.size > 0 ? new Set() : new Set(treeStructure.map(n => n.id)))}
            className="w-full sm:w-auto"
          >
            {expandedNodes.size > 0 ? "Collapse All" : "Expand All"}
          </Button>
        </div>

        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-2 sm:p-4 bg-white dark:bg-gray-800">
          <div className="space-y-1">
            {treeStructure.map((node) => renderTreeNode(node))}
          </div>
        </div>
      </div>
    )
}