"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Users, Search, Wallet, Calendar, CheckCircle2, User, TrendingUp, Zap } from "lucide-react"
import { type User as UserType } from "../lib/api"

interface UsersListProps {
  users: UserType[]
  onUserSelect: (user: UserType) => void
}

export function UsersList({ users, onUserSelect }: UsersListProps) {
  const [searchTerm, setSearchTerm] = useState("")

  // Sort users by points, then by last activity
  const sortedUsers = [...users]
    .sort((a, b) => {
      // Primary sort: points
      const pointsDiff = (b.points || 0) - (a.points || 0)
      if (pointsDiff !== 0) return pointsDiff

      // Secondary sort: last activity (more recent first)
      const aDate = a.last_activity ? new Date(a.last_activity) : new Date(0)
      const bDate = b.last_activity ? new Date(b.last_activity) : new Date(0)
      return bDate.getTime() - aDate.getTime()
    })

  const filteredUsers = sortedUsers.filter((user) =>
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.user?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    false
  )


  const getUserStatus = (user: UserType) => {
    const dexTask = user.quests?.customTasks?.find((task: any) => task.subtype === "dex")
    if (dexTask?.completed) return { status: "completed", color: "from-green-500 to-emerald-600", icon: CheckCircle2 }
    if (dexTask) return { status: "active", color: "from-blue-500 to-cyan-600", icon: Zap }
    if (user.external_wallet_address) return { status: "connected", color: "from-purple-500 to-indigo-600", icon: Wallet }
    return { status: "new", color: "from-slate-500 to-slate-600", icon: User }
  }

  const getCompletedQuestsCount = (user: UserType) => {
    if (!user.quests) return 0

    const completed = [
      ...(user.quests.quizTasks?.filter(task => task.completed) || []),
      ...(user.quests.videoTasks?.filter(task => task.completed) || []),
      ...(user.quests.socialTasks?.filter(task => task.completed) || []),
      ...(user.quests.customTasks?.filter(task => task.completed) || []),
      ...(user.quests.dexTasks?.filter(task => task.completed) || []),
    ]

    return completed.length
  }

  const getTotalQuestsCount = (user: UserType) => {
    if (!user.quests) return 0

    const total = [
      ...(user.quests.quizTasks || []),
      ...(user.quests.videoTasks || []),
      ...(user.quests.socialTasks || []),
      ...(user.quests.customTasks || []),
      ...(user.quests.dexTasks || []),
    ]

    return total.length
  }

  return (
    <Card className="col-span-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Active Users
            </CardTitle>
            <p className="text-muted-foreground text-sm mt-1">
              {users.length} users sorted by activity and points
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-48"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {filteredUsers.map((user) => {
            const userStatus = getUserStatus(user)
            const Icon = userStatus.icon
            const gradient = userStatus.color
            const completedQuests = getCompletedQuestsCount(user)
            const totalQuests = getTotalQuestsCount(user)
            const completionRate = totalQuests > 0 ? ((completedQuests / totalQuests) * 100).toFixed(0) : "0"

            return (
              <div
                key={user.user || user.id}
                className="group relative overflow-hidden p-6 bg-gradient-to-r from-white to-slate-50 dark:from-slate-800 dark:to-slate-700 rounded-2xl border border-slate-200 dark:border-slate-600 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
              >
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-2xl -translate-y-16 translate-x-16" />

                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 bg-gradient-to-r ${gradient} rounded-2xl shadow-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-slate-900 dark:text-slate-100 text-lg">
                          {user.username || user.user || `User ${user.id}`}
                        </span>
                        {user.external_wallet_address && (
                          <Badge variant="outline" className="text-xs">
                            <Wallet className="w-3 h-3 mr-1" />
                            Connected
                          </Badge>
                        )}
                        {(() => {
                          const dexTask = user.quests?.customTasks?.find((task: any) => task.subtype === "dex")
                          if (dexTask?.completed) {
                            return (
                              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 text-xs">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                DEX Complete
                              </Badge>
                            )
                          }
                          if (dexTask) {
                            return (
                              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 text-xs">
                                <Zap className="w-3 h-3 mr-1" />
                                DEX Active
                              </Badge>
                            )
                          }
                          return null
                        })()}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          {completedQuests}/{totalQuests} quests
                        </span>
                        <span className="flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          {user.points || 0} points
                        </span>
                        {user.last_activity && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(user.last_activity).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-emerald-600">{completionRate}%</div>
                      <div className="text-xs text-slate-500">completion</div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => onUserSelect(user)}
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 shadow-lg"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Analyze
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 w-fit mx-auto mb-4">
                <Search className="w-12 h-12 text-slate-500 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">No Users Found</h3>
              <p className="text-slate-600 dark:text-slate-400">Try adjusting your search criteria</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

