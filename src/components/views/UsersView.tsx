import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { UsersList } from "../users-list"
import { EnrichedUserActivity } from "../enriched-user-activity"
import { api, type User } from "../../lib/api"

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
          { quiz_id: "quiz-1752158562660", question_id: "question-1752158562660", answer_id: "option-1-1752158562660" },
        ],
      },
      completed_at: "2025-07-10T15:18:38.041Z",
    },
  },
}

interface UsersViewProps {
  selectedCampaign: string
  dateRange: { from: Date; to: Date }
  isLoading: boolean
}

export function UsersView({ selectedCampaign, dateRange, isLoading }: UsersViewProps) {
  const [users, setUsers] = React.useState<User[]>([])
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null)

  React.useEffect(() => {
    const loadData = async () => {
      try {
        const data = await api.getUsers()
        setUsers(data)
      } catch (error) {
        console.error("Failed to load users data:", error)
      }
    }

    loadData()
  }, [selectedCampaign])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading users data...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User Activity</CardTitle>
            <CardDescription>Real-time user engagement and activity</CardDescription>
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
            <CardDescription>Campaign participants and their progress</CardDescription>
          </CardHeader>
          <CardContent>
            <UsersList
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
            <CardDescription>Detailed activity and progress information</CardDescription>
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
                    <span className="text-muted-foreground">Quests Completed:</span>
                    <span>{selectedUser.quests_completed}</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Activity Timeline</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Completed At:</span>
                    <span>{new Date(selectedUser.completed_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Activity:</span>
                    <span>{new Date(selectedUser.last_activity).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 