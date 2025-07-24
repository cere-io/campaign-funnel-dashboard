import React, {useEffect} from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Search, ArrowLeft, Users, Trophy } from "lucide-react";
import { api, type User } from "../../lib/api";

interface UsersViewProps {
  selectedCampaign: string;
  selectedOrganization: string;
  dateRange: { from: Date; to: Date };
  isLoading: boolean;
}

export function UsersView({
  selectedCampaign,
  selectedOrganization,
  dateRange,
  isLoading,
}: UsersViewProps) {
  const [users, setUsers] = React.useState<User[]>([]);
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
  const [searchTerm, setSearchTerm] = React.useState("");

  console.log({selectedUser})
  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await api.getUsers({
          campaignId: selectedCampaign,
          organizationId: selectedOrganization,
          dateFrom: dateRange.from.toISOString(),
          dateTo: dateRange.to.toISOString(),
        });
        setUsers(response);
      } catch (error) {
        console.error("Failed to load users data:", error);
      }
    };

    loadData();
  }, [dateRange.from, dateRange.to, selectedCampaign, selectedOrganization]);

  useEffect(() => {
    const loadData = async () => {
      if (!selectedUser) return
      try {
        const response = await api.getUserActivity({
          campaignId: selectedCampaign,
          userId: selectedUser.user,
        });
        setSelectedUser(response);
      } catch (error) {
        console.error("Failed to load users data:", error);
      }
    };

    loadData();
  }, [selectedCampaign, selectedUser])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading users data...</div>
      </div>
    );
  }

  const filteredUsers = users.filter(
    (user) =>
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.user?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const averagePoints = users.length > 0
    ? Math.round(users.reduce((sum, user) => sum + user.points, 0) / users.length)
    : 0;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const formatAccountId = (accountId: string) => {
    return `${accountId?.slice(0, 8)}...${accountId?.slice(-8)}`;
  };

  if (selectedUser) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => setSelectedUser(null)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Users
          </Button>
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <span className="text-lg font-semibold text-primary">
              {selectedUser.username?.slice(0, 2).toUpperCase()}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-semibold">{selectedUser.username}</h2>
            <p className="text-sm text-muted-foreground font-mono">
              {selectedUser.user}
            </p>
          </div>
        </div>

        {/* User Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700 dark:text-green-300">
                    Amount Traded
                  </p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                    $2,450
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400">
                    Following DEX swaps
                  </p>
                </div>
                <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 text-sm">$</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-700 dark:text-orange-300">
                    Preferred Quests
                  </p>
                  <p className="text-sm font-semibold text-orange-900 dark:text-orange-100">
                    Video, custom (3), quiz (1)
                  </p>
                  <p className="text-xs text-orange-600 dark:text-orange-400">
                    Video highlighted
                  </p>
                </div>
                <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-orange-600 text-sm">★</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    Completion Rate
                  </p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    87.5%
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    7/8 completed
                  </p>
                </div>
                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 text-sm">📊</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Activity Timeline</CardTitle>
            <CardDescription>
              Detailed quest completion journey with interactive elements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Activity items would go here - similar to the enriched user activity component */}
              <div className="text-center text-muted-foreground py-8">
                Activity timeline details would be displayed here
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Users</h1>
        <p className="text-muted-foreground">
          Click on a user to view their detailed activity
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by username or account ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{users.length}</p>
                <p className="text-sm text-muted-foreground">In this stage</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                <Trophy className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{averagePoints}</p>
                <p className="text-sm text-muted-foreground">Per user</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>User List</CardTitle>
          <CardDescription>
            {filteredUsers.length} users found. Click on any user to view their detailed activity.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Username</th>
                  <th className="text-left py-3 px-4 font-medium">Account ID</th>
                  <th className="text-left py-3 px-4 font-medium">Total Points</th>
                  <th className="text-left py-3 px-4 font-medium">Quests</th>
                  <th className="text-left py-3 px-4 font-medium">Completed At</th>
                  <th className="text-left py-3 px-4 font-medium">Last Activity</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b hover:bg-muted/50 cursor-pointer"
                    onClick={() => setSelectedUser(user)}
                  >
                    <td className="py-3 px-4 font-medium">{user.username}</td>
                    <td className="py-3 px-4 font-mono text-sm text-muted-foreground">
                      {formatAccountId(user.user)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-green-600 font-medium">
                        {user.points}
                      </span>
                    </td>
                    <td className="py-3 px-4">{user.quests_completed}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {formatDate(user.completed_at)}
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {formatDate(user.last_activity)}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        Active
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
