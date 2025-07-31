"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { Input } from "./ui/input"
import { Users, Search, Trophy, User as UserIcon, Calendar, TrendingUp } from "lucide-react"
import { type User } from '../lib/api';

interface StageUsersModalProps {
  isOpen: boolean
  onClose: () => void
  stage: string
  campaignId: string
  users: User[]
}

export function StageUsersModal({ isOpen, onClose, stage, users, campaignId }: StageUsersModalProps) {
  const [searchTerm, setSearchTerm] = useState("")

  // Filter users based on stage requirements
  const getFilteredUsersByStage = () => {
    if (!users) return []
    
    switch (stage) {
      case "started":
        // Users Who Started DEX Swap - users with DEX task (regardless of completion)
        return users.filter(user => {
          const dexTask = user.quests?.customTasks?.find((task: any) => task.subtype === "dex")
          return !!dexTask // Has DEX task, regardless of completion status
        })
      case "connected":
        // Users who connected wallet (have external_wallet_address)
        return users.filter(user => user.external_wallet_address)
      case "completed":
        // Users Who Completed Trade - users with completed DEX task
        return users.filter(user => {
          const dexTask = user.quests?.customTasks?.find((task: any) => task.subtype === "dex")
          return dexTask?.completed === true // Specifically completed DEX swap
        })
      default:
        return users
    }
  }

  const stageUsers = getFilteredUsersByStage()
  
  const filteredUsers = stageUsers.filter((user) =>
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.user?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStageTitle = (stage: string) => {
    switch (stage) {
      case "started":
        return "Users Who Started DEX Swap"
      case "connected":  
        return "Users Who Connected Wallet"
      case "completed":
        return "Users Who Completed Trade"
      default:
        return `Users - ${stage}`
    }
  }

  const getStageDescription = (stage: string) => {
    switch (stage) {
      case "started":
        return "Users who have the Pineapple DEX swap task (started ETH to PAPPLE swap process)"
      case "connected":
        return "Users who successfully connected their wallets to the platform"
      case "completed":
        return "Users who successfully completed the ETH to PAPPLE swap on Pineapple DEX"
      default:
        return `Campaign ${campaignId} - Stage: ${stage}`
    }
  }

  const getStatusBadge = (user: User) => {
    const dexTask = user.quests?.customTasks?.find((task: any) => task.subtype === "dex")
    
    if (!dexTask) {
      return (
        <Badge variant="outline" className="text-xs">
          No DEX Task
        </Badge>
      )
    }
    
    return (
      <Badge variant={dexTask.completed ? "default" : "secondary"} className="text-xs">
        {dexTask.completed ? "Swap Completed" : "Swap Started"}
      </Badge>
    )
  }

  const getCompletedQuestsByType = (user: User) => {
    const quests = user.quests
    if (!quests) return 0
    
    const completedCounts = {
      quiz: quests.quizTasks?.filter((task: any) => task.completed).length || 0,
      video: quests.videoTasks?.filter((task: any) => task.completed).length || 0,
      custom: quests.customTasks?.filter((task: any) => task.completed).length || 0,
      social: quests.socialTasks?.filter((task: any) => task.completed).length || 0,
    }
    
    return Object.values(completedCounts).reduce((sum, count) => sum + count, 0)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Users className="w-5 h-5" />
            {getStageTitle(stage)}
          </DialogTitle>
          <p className="text-muted-foreground">{getStageDescription(stage)}</p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold">{stageUsers?.length || 0}</div>
                  <div className="text-xs text-muted-foreground">Stage Users</div>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-green-600" />
                                  <div>
                    <div className="text-2xl font-bold">
                      {stageUsers?.filter((u) => {
                        const dexTask = u.quests?.customTasks?.find((task: any) => task.subtype === "dex")
                        return dexTask?.completed === true
                      }).length || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">DEX Completed</div>
                  </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-600" />
                <div>
                  <div className="text-2xl font-bold">
                    {stageUsers?.length > 0 ? Math.round(stageUsers.reduce((sum, u) => sum + (u.points || 0), 0) / stageUsers.length) : 0}
                  </div>
                  <div className="text-xs text-muted-foreground">Avg Points</div>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-orange-600" />
                <div>
                  <div className="text-2xl font-bold">
                    {stageUsers?.length > 0 ? new Set(stageUsers.filter(u => u.last_activity).map((u) => new Date(u.last_activity).toDateString())).size : 0}
                  </div>
                  <div className="text-xs text-muted-foreground">Active Days</div>
                </div>
              </div>
            </Card>
          </div>

          {/* Users List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">User Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                                {filteredUsers?.map((user, index) => (
                  <div
                    key={user.user || index}
                    className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                        <UserIcon className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium">{user.username || user.user}</div>
                        <div className="text-sm text-muted-foreground">
                          {user.last_activity ? new Date(user.last_activity).toLocaleString() : 'No activity'}
                        </div>
                        {user.external_wallet_address && (
                          <div className="text-xs text-muted-foreground font-mono">
                            {user.external_wallet_address.substring(0, 20)}...
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <div className="text-xs text-muted-foreground">
                            {getCompletedQuestsByType(user)}/{user.quests_completed || 0} quests
                          </div>
                          {(() => {
                            const dexTask = user.quests?.customTasks?.find((task: any) => task.subtype === "dex")
                            if (dexTask) {
                              return (
                                <div className="text-xs text-blue-600 font-medium">
                                  DEX: {dexTask.completed ? "✓ Completed" : "⏳ Started"}
                                </div>
                              )
                            }
                            return null
                          })()}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-medium text-green-600">+{user.points || 0}</div>
                        <div className="text-xs text-muted-foreground">points</div>
                      </div>
                      {getStatusBadge(user)}
                    </div>
                  </div>
                ))}

                {filteredUsers.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">No users found matching your search.</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
