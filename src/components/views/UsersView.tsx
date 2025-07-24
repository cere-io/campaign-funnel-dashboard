import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { UsersList } from "../users-list";
import { EnrichedUserActivity } from "../enriched-user-activity";
import { api, type User } from "../../lib/api";

// Mock user activity data
const mockEnrichedUserActivity = {
  username: "mazhutoanton",
  account_id: "6R44Eo6brL3YMMtFuocjgdCN9REzpHHWCGS5AVh49btFN13J",
  organization_id: "2115",
  campaign_id: "58",
  activities: {
    "2025-07-10T15:18:24.425Z": {
      account_id: "6R44Eo6brL3YMMtFuocjgdCN9REzpHHWCGS5AVh49btFN13J",
      organization_id: "2115",
      campaign_id: "58",
      quest_type: "quiz",
      points: 30,
      started_at: "2025-07-10T15:18:24.425Z",
      payload: {
        answers: [
          {
            quiz_id: "quiz-1752158562660",
            question_id: "question-1752158562660",
            answer_id: "option-1-1752158562660",
          },
        ],
      },
      completed_at: "2025-07-10T15:18:38.041Z",
    },
  },
};

// Mock users data
const mockUsers: User[] = [
  {
    id: "1",
    username: "mazhutoanton",
    account_id: "6R44Eo6brL3YMMtFuocjgdCN9REzpHHWCGS5AVh49btFN13J",
    completed_at: "2025-07-10T15:18:38.041Z",
    total_points: 150,
    quests_completed: 5,
    last_activity: "2025-07-10T15:18:38.041Z",
  },
  {
    id: "2",
    username: "react_dev",
    account_id: "7R44Eo6brL3YMMtFuocjgdCN9REzpHHWCGS5AVh49btFN13J",
    completed_at: "2025-07-09T14:20:15.123Z",
    total_points: 120,
    quests_completed: 4,
    last_activity: "2025-07-09T14:20:15.123Z",
  },
  {
    id: "3",
    username: "ai_researcher",
    account_id: "8R44Eo6brL3YMMtFuocjgdCN9REzpHHWCGS5AVh49btFN13J",
    completed_at: "2025-07-08T10:30:45.789Z",
    total_points: 200,
    quests_completed: 7,
    last_activity: "2025-07-08T10:30:45.789Z",
  },
  {
    id: "4",
    username: "sports_fan",
    account_id: "9R44Eo6brL3YMMtFuocjgdCN9REzpHHWCGS5AVh49btFN13J",
    completed_at: "2025-07-07T16:45:22.456Z",
    total_points: 80,
    quests_completed: 3,
    last_activity: "2025-07-07T16:45:22.456Z",
  },
  {
    id: "5",
    username: "webdev_enthusiast",
    account_id: "10R44Eo6brL3YMMtFuocjgdCN9REzpHHWCGS5AVh49btFN13J",
    completed_at: "2025-07-06T12:15:33.789Z",
    total_points: 180,
    quests_completed: 6,
    last_activity: "2025-07-06T12:15:33.789Z",
  },
];

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

  React.useEffect(() => {
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading users data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User Activity</CardTitle>
            <CardDescription>
              Real-time user engagement and activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EnrichedUserActivity
              user={mockEnrichedUserActivity}
              onBack={() => {}}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Users List</CardTitle>
            <CardDescription>
              Campaign participants and their progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UsersList
              users={users}
              stage={null}
              onBack={() => {}}
              onUserSelect={setSelectedUser}
            />
          </CardContent>
        </Card>
      </div>

      {selectedUser && (
        <Card>
          <CardHeader>
            <CardTitle>User Details: {selectedUser.username}</CardTitle>
            <CardDescription>
              Detailed activity and progress information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-medium mb-2">Account Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Account ID:</span>
                    <span className="font-mono">{selectedUser.account_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Points:</span>
                    <span>{selectedUser.total_points}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Quests Completed:
                    </span>
                    <span>{selectedUser.quests_completed}</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Activity Timeline</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Completed At:</span>
                    <span>
                      {new Date(selectedUser.completed_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Last Activity:
                    </span>
                    <span>
                      {new Date(
                        selectedUser.last_activity,
                      ).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
