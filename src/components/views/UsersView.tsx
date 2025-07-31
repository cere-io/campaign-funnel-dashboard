import { type User } from "../../lib/api";
import { UsersList } from "../users-list";
import { EnrichedUserActivity } from "../enriched-user-activity";
import { Loader } from "../ui/loader.tsx";

interface UsersViewProps {
  users: User[];
  isLoading: boolean;
  user: User;
  onSelect: (user: User | null) => void;
  campaignId: string;
}

export function UsersView({
  users,
  isLoading,
  user,
  onSelect,
  campaignId,
}: UsersViewProps) {
  if (isLoading) {
    return <Loader />;
  }



  const handleUserSelect = (user: User) => {
    onSelect?.(user);
  };

  if (user) {
    return (
      <EnrichedUserActivity
        user={user}
        onBack={() => onSelect(null)}
        campaignId={campaignId}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          User Activity
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          User engagement patterns and insights
        </p>
      </div>

      <UsersList users={users} onUserSelect={handleUserSelect} />
    </div>
  );
}
