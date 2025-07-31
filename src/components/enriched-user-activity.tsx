"use client";

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Button } from "./ui/button";
import {
  Clock,
  Trophy,
  Brain,
  Play,
  Wallet,
  Twitter,
  CheckCircle,
  Target,
  TrendingUp,
  ArrowLeft,
  MessageSquare,
} from "lucide-react";
import {
  type User as UserType,
  type User,
} from "../lib/api.ts";

interface EnrichedUserActivityProps {
  user: User;
  onBack: () => void;
  campaignId: string;
  onViewTelegramActivity?: (user: User) => void;
}

export function EnrichedUserActivity({
  user,
  onBack,
  campaignId,
  onViewTelegramActivity,
}: EnrichedUserActivityProps) {

  // Extract quest activities from user data
  const getAllQuests = (user: UserType) => {
    if (!user.quests) return [];

    const allQuests = [
      ...(user.quests.quizTasks || []).map(task => ({
        id: task.id,
        title: task.title,
        type: 'quiz' as const,
        completed: task.completed,
        points: 10, // Default points for quiz
        subtype: undefined
      })),
      ...(user.quests.videoTasks || []).map(task => ({
        id: task.id,
        title: task.title,
        type: 'video' as const,
        completed: task.completed,
        points: task.points || 15,
        subtype: task.type
      })),
      ...(user.quests.socialTasks || []).map(task => ({
        id: task.id,
        title: `Social Task ${task.id}`,
        type: 'social' as const,
        completed: task.completed,
        points: 5,
        subtype: 'x_connect'
      })),
      ...(user.quests.customTasks || []).map(task => ({
        id: task.id,
        title: task.title,
        type: 'custom' as const,
        completed: task.completed,
        points: task.points || 20,
        subtype: task.subtype
      })),
      ...(user.quests.dexTasks || []).map(task => ({
        id: task.id,
        title: `DEX Task ${task.id}`,
        type: 'dex' as const,
        completed: task.completed,
        points: 50,
        subtype: 'dex'
      }))
    ];

    return allQuests;
  };

  const allQuests = getAllQuests(user);

  const getQuestIcon = (questType: string, subtype?: string) => {
    if (questType === "quiz") return Brain;
    if (questType === "video") return Play;
    if (questType === "custom") {
      if (subtype === "wallet") return Wallet;
      if (subtype === "dex") return Trophy;
      if (subtype === "x_connect") return Twitter;
    }
    return Clock;
  };

  const getQuestLabel = (questType: string, subtype?: string) => {
    if (questType === "quiz") return "Quiz";
    if (questType === "video") return "Video";
    if (questType === "custom") {
      if (subtype === "wallet") return "Wallet Connection";
      if (subtype === "dex") return "DEX Trade";
      if (subtype === "x_connect") return "X Connection";
      return "Custom Quest";
    }
    return questType;
  };

  const getTotalQuestsCount = (user: UserType) => {
    if (!user.quests) return 0;

    const total = [
      ...(user.quests.quizTasks || []),
      ...(user.quests.videoTasks || []),
      ...(user.quests.socialTasks || []),
      ...(user.quests.customTasks || []),
      ...(user.quests.dexTasks || []),
    ];

    return total.length;
  };

  const getCompletedQuestsCount = (user: UserType) => {
    if (!user.quests) return 0;

    const completed = [
      ...(user.quests.quizTasks?.filter((task) => task.completed) || []),
      ...(user.quests.videoTasks?.filter((task) => task.completed) || []),
      ...(user.quests.socialTasks?.filter((task) => task.completed) || []),
      ...(user.quests.customTasks?.filter((task) => task.completed) || []),
      ...(user.quests.dexTasks?.filter((task) => task.completed) || []),
    ];

    return completed.length;
  };

  const completedQuests = getCompletedQuestsCount(user);
  const totalQuests = getTotalQuestsCount(user);
  const completionRate =
    totalQuests > 0 ? ((completedQuests / totalQuests) * 100).toFixed(0) : "0";

  // Calculate total points from user data instead of activities
  const totalPoints = user.points || 0;

  // Calculate quest type stats from user.quests
  const questTypeStats = allQuests.reduce(
    (acc, quest) => {
      const key = quest.type;
      if (!acc[key]) {
        acc[key] = { total: 0, completed: 0, points: 0 };
      }
      acc[key].total++;
      if (quest.completed) acc[key].completed++;
      acc[key].points += quest.points;
      return acc;
    },
    {} as Record<string, { total: number; completed: number; points: number }>,
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Users
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              User Details
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {user.username}: {user.user}
            </p>
          </div>
        </div>

        {/* Telegram Activity Button */}
        {onViewTelegramActivity && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewTelegramActivity(user)}
            className="border-purple-300 text-purple-700 hover:bg-purple-50"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Telegram Activity
          </Button>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Activities
                </p>
                <p className="text-2xl font-bold">{totalQuests}</p>
              </div>
              <Target className="w-6 h-6 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Completed
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {completedQuests}
                </p>
              </div>
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Points
                </p>
                <p className="text-2xl font-bold text-purple-600">
                  {totalPoints}
                </p>
              </div>
              <Trophy className="w-6 h-6 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Completion Rate
                </p>
                <p className="text-2xl font-bold text-orange-600">
                  {Number(completionRate).toFixed(0)}%
                </p>
              </div>
              <TrendingUp className="w-6 h-6 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quest Type Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Quest Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(questTypeStats).map(([questType, stats]) => {
              const Icon = getQuestIcon(questType);
              const progress = (stats.completed / stats.total) * 100;

              return (
                <div key={questType} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Icon className="w-5 h-5 text-gray-600" />
                      <span className="font-medium capitalize">
                        {getQuestLabel(questType)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {stats.completed}/{stats.total} • {stats.points} pts
                    </div>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Activity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Quest Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {allQuests.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No quest activities found
              </div>
            ) : (
              allQuests
                .sort((a, b) => {
                  // Sort completed quests first, then by completion status
                  if (a.completed && !b.completed) return -1;
                  if (!a.completed && b.completed) return 1;
                  return 0;
                })
                .map((quest, index) => {
                  const Icon = getQuestIcon(quest.type, quest.subtype);
                  const isCompleted = quest.completed;

                  return (
                    <div
                      key={`${quest.type}-${quest.id}-${index}`}
                      className="flex items-start space-x-4 p-4 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div
                        className={`p-2 rounded-full ${
                          isCompleted 
                            ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300" 
                            : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {quest.title || getQuestLabel(quest.type, quest.subtype)}
                          </p>
                          <Badge
                            variant={isCompleted ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {isCompleted ? "Completed" : "In Progress"}
                          </Badge>
                          {quest.points > 0 && (
                            <Badge variant="outline" className="text-xs">
                              +{quest.points} pts
                            </Badge>
                          )}
                          {quest.subtype === 'dex' && (
                            <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100 text-xs">
                              DEX
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                          <span className="flex items-center space-x-1">
                            <Target className="w-3 h-3" />
                            <span className="capitalize">{quest.type} Quest</span>
                          </span>
                          {user.last_activity && (
                            <span className="flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>
                                Last Activity: {new Date(user.last_activity).toLocaleDateString()}
                              </span>
                            </span>
                          )}
                          {quest.subtype && (
                            <span className="flex items-center space-x-1">
                              <Badge variant="outline" className="text-xs">
                                {quest.subtype}
                              </Badge>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
            )}

            {/* User Stats Summary */}
            {user.external_wallet_address && (
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center space-x-2 mb-2">
                  <Wallet className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-900 dark:text-blue-100">Wallet Connected</span>
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-300 font-mono">
                  {user.external_wallet_address.substring(0, 6)}...{user.external_wallet_address.substring(-4)}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
