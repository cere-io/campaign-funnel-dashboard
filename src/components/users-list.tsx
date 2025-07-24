import { useState } from "react"
import { ArrowLeft, User, Trophy, Search } from "lucide-react"
import { format } from "date-fns"

import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Input } from "./ui/input"
import { Badge } from "./ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"

// Mock users who completed trades
const mockCompletedTradeUsers = [
  {
    id: "1",
    username: "mazhutoanton",
    account_id: "6R44Eo6brL3YMMtFuocjgdCN9REzpHHWCGS5AVh49btFN13J",
    completed_at: "2025-07-20T19:34:00.000Z",
    total_points: 280,
    quests_completed: 7,
    last_activity: "2025-07-22T10:04:38.399Z",
  },
  {
    id: "2",
    username: "cryptotrader99",
    account_id: "5A3xK8oWx4qtqAqUkjX2KaCa8CgSRhkckQX2Tz4E8GMxhGjM",
    completed_at: "2025-07-21T14:22:15.000Z",
    total_points: 195,
    quests_completed: 5,
    last_activity: "2025-07-21T16:45:22.000Z",
  },
  {
    id: "3",
    username: "defi_explorer",
    account_id: "1A1LLiH7vQ5Vpm7JMaiL125RHNFMEQZvBvkVwANffAzXgSP",
    completed_at: "2025-07-19T09:15:30.000Z",
    total_points: 340,
    quests_completed: 9,
    last_activity: "2025-07-22T08:30:15.000Z",
  },
  {
    id: "4",
    username: "blockchain_bob",
    account_id: "12D3KooWBmAwcd4PJNJvfV89HwE48nwkRmAgo8Vy3uQEyNNHBox2",
    completed_at: "2025-07-18T20:45:12.000Z",
    total_points: 150,
    quests_completed: 4,
    last_activity: "2025-07-20T12:15:45.000Z",
  },
  {
    id: "5",
    username: "yield_farmer",
    account_id: "14E5nqKAp3oAJcmzgZhUD2RcptBeUBScxKHgJKU4HPNcKVf3",
    completed_at: "2025-07-17T11:30:45.000Z",
    total_points: 220,
    quests_completed: 6,
    last_activity: "2025-07-19T14:20:30.000Z",
  },
]

interface UsersListProps {
  stage: string | null
  onBack: () => void
  onUserSelect: (user: any) => void
}

export function UsersList({ stage, onBack, onUserSelect }: UsersListProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredUsers = mockCompletedTradeUsers.filter(
    (user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.account_id.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStageTitle = (stage: string | null) => {
    switch (stage) {
      case "completedTrade":
        return "Users Who Completed Trade"
      case "connectedWallet":
        return "Users Who Connected Wallet"
      case "startedDexSwap":
        return "Users Who Started DEX Swap"
      default:
        return "Users"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
          <Button variant="outline" onClick={onBack} size="sm" className="w-fit bg-transparent">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{getStageTitle(stage)}</h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Click on a user to view their detailed activity
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by username or account ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-2 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredUsers.length}</div>
              <p className="text-xs text-muted-foreground">In this stage</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Points</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(filteredUsers.reduce((sum, user) => sum + user.total_points, 0) / filteredUsers.length)}
              </div>
              <p className="text-xs text-muted-foreground">Per user</p>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">User List</CardTitle>
            <CardDescription>
              {filteredUsers.length} users found. Click on any user to view their detailed activity.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Account ID</TableHead>
                  <TableHead>Total Points</TableHead>
                  <TableHead>Quests</TableHead>
                  <TableHead>Completed At</TableHead>
                  <TableHead>Last Activity</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow
                    key={user.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => onUserSelect(user)}
                  >
                    <TableCell className="font-medium">{user.username}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {user.account_id.slice(0, 12)}...{user.account_id.slice(-8)}
                    </TableCell>
                    <TableCell className="text-green-600 font-semibold">{user.total_points}</TableCell>
                    <TableCell>{user.quests_completed}</TableCell>
                    <TableCell>{format(new Date(user.completed_at), "MMM dd, HH:mm")}</TableCell>
                    <TableCell>{format(new Date(user.last_activity), "MMM dd, HH:mm")}</TableCell>
                    <TableCell>
                      <Badge variant="default">Active</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
