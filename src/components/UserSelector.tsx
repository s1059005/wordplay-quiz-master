
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { User } from "@/types";
import { toast } from "sonner";
import { Plus, Edit, Trash } from "lucide-react";

interface UserSelectorProps {
  users: User[];
  selectedUserId: string | null;
  onSelectUser: (userId: string) => void;
  onAddUser: (name: string) => void;
  onDeleteUser: (userId: string) => void;
}

const UserSelector: React.FC<UserSelectorProps> = ({
  users,
  selectedUserId,
  onSelectUser,
  onAddUser,
  onDeleteUser,
}) => {
  const [newUserName, setNewUserName] = useState<string>("");
  const [isAddingUser, setIsAddingUser] = useState<boolean>(false);

  const handleAddUser = () => {
    if (!newUserName.trim()) {
      toast.error("Please enter a name");
      return;
    }

    onAddUser(newUserName.trim());
    setNewUserName("");
    setIsAddingUser(false);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl text-center">User Selection</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users.length > 0 ? (
            <div className="grid gap-2">
              {users.map((user) => (
                <div
                  key={user.id}
                  className={`flex items-center justify-between p-3 rounded-md cursor-pointer hover:bg-muted transition-colors ${
                    selectedUserId === user.id
                      ? "bg-primary/10 border border-primary"
                      : "bg-card"
                  }`}
                  onClick={() => onSelectUser(user.id)}
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{user.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {user.words.length} vocabulary words
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteUser(user.id);
                    }}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No users yet. Add a new user to get started.
            </div>
          )}

          {isAddingUser ? (
            <div className="flex gap-2">
              <Input
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                placeholder="Enter user name"
                className="flex-1"
                autoFocus
              />
              <Button variant="default" onClick={handleAddUser}>
                Add
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddingUser(false);
                  setNewUserName("");
                }}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setIsAddingUser(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New User
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserSelector;
