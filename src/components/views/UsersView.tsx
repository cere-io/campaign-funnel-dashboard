import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Search, Users, Trophy } from "lucide-react";
import { api, type User } from "../../lib/api";
import { UserActivityDetail } from "../user-activity-detail";
import {Loader} from "../ui/loader.tsx";

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
  isLoading: isRefreshing,
}: UsersViewProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  console.log({ selectedUser });
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const response = await api.getUsers({
          campaignId: selectedCampaign,
          organizationId: selectedOrganization,
          dateFrom: dateRange.from.toISOString(),
          dateTo: dateRange.to.toISOString(),
        });
        setUsers(response);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to load users data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [dateRange.from, dateRange.to, selectedCampaign, selectedOrganization]);

  if (isLoading || isRefreshing) {
    return <Loader />;
  }

  const filteredUsers = users.filter(
    (user) =>
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.user?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const averagePoints =
    users.length > 0
      ? Math.round(
          users.reduce((sum, user) => sum + user.points, 0) / users.length,
        )
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
      <UserActivityDetail
        campaignId={selectedCampaign}
        user={selectedUser}
        onBack={() => setSelectedUser(null)}
      />
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
            {filteredUsers.length} users found. Click on any user to view their
            detailed activity.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Username</th>
                  <th className="text-left py-3 px-4 font-medium">
                    Account ID
                  </th>
                  <th className="text-left py-3 px-4 font-medium">
                    Total Points
                  </th>
                  <th className="text-left py-3 px-4 font-medium">Quests</th>
                  <th className="text-left py-3 px-4 font-medium">
                    Completed At
                  </th>
                  <th className="text-left py-3 px-4 font-medium">
                    Last Activity
                  </th>
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
                      <Badge
                        variant="secondary"
                        className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      >
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
