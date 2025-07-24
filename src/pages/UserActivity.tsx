import { useState } from "react"
import { UsersList } from "../components/users-list"
import { UserActivityDetail } from "../components/user-activity-detail"

export default function UserActivityDashboard() {
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [currentStage, setCurrentStage] = useState<string | null>(null)

  const handleUserSelect = (user: any) => {
    setSelectedUser(user)
  }

  const handleBackToUsers = () => {
    setSelectedUser(null)
  }

  const handleBackToDashboard = () => {
    setSelectedUser(null)
    setCurrentStage(null)
  }

  // If a user is selected, show the detail view
  if (selectedUser) {
    return <UserActivityDetail user={selectedUser} onBack={handleBackToUsers} />
  }

  // Otherwise, show the users list
  return (
    <UsersList
      stage={currentStage}
      onBack={handleBackToDashboard}
      onUserSelect={handleUserSelect}
    />
  )
} 