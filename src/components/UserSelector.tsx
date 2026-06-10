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
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  const handleAddUser = () => {
    if (!newUserName.trim()) {
      toast.error("請輸入名稱");
      return;
    }

    onAddUser(newUserName.trim());
    setNewUserName("");
    setIsAddingUser(false);
  };

  return (
    <Card className="retro-border">
      <CardHeader>
        <CardTitle className="text-xl text-center font-pixel text-primary drop-shadow-md">
          勇者選擇 [SELECT PLAYER]
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users.length > 0 ? (
            <div className="grid gap-4">
              {users.map((user) => (
                <div
                  key={user.id}
                  className={`flex items-center justify-between p-4 cursor-pointer transition-all ${
                    selectedUserId === user.id
                      ? "bg-primary/20 border-2 border-primary shadow-[0_0_10px_rgba(240,165,0,0.5)]"
                      : "bg-black/40 border-2 border-primary/20 hover:border-primary/60"
                  }`}
                  onClick={() => onSelectUser(user.id)}
                >
                  <div className="flex flex-col">
                    <span className="font-pixel text-[10px] text-primary">{user.name}</span>
                    <span className="font-vt323 text-primary/60">
                      LV. {user.words.length} 單字儲備
                    </span>
                  </div>
                  {deletingUserId === user.id ? (
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <span className="text-[10px] font-pixel text-red-500 animate-pulse">刪除？</span>
                      <button
                        className="retro-button bg-red-950/60 border-red-500 text-red-400 text-[8px] py-1 px-2 hover:bg-red-900"
                        onClick={() => {
                          onDeleteUser(user.id);
                          setDeletingUserId(null);
                        }}
                      >
                        是 [YES]
                      </button>
                      <button
                        className="retro-button bg-transparent border-primary/40 text-primary/70 text-[8px] py-1 px-2 hover:border-primary"
                        onClick={() => setDeletingUserId(null)}
                      >
                        否 [NO]
                      </button>
                    </div>
                  ) : (
                    <button
                      className="p-2 text-primary hover:text-red-500 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletingUserId(user.id);
                      }}
                    >
                      <Trash className="h-5 w-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              尚未有使用者。新增使用者以開始使用。
            </div>
          )}

          {isAddingUser ? (
            <div className="flex flex-col gap-4 p-4 border-2 border-dashed border-primary/30">
              <input
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                placeholder="輸入勇者之名..."
                className="retro-input w-full"
                autoFocus
              />
              <div className="flex gap-4">
                <button className="flex-1 retro-button" onClick={handleAddUser}>
                  召喚 [OK]
                </button>
                <button
                  className="flex-1 retro-button bg-red-900/20 border-red-500 text-red-400"
                  onClick={() => {
                    setIsAddingUser(false);
                    setNewUserName("");
                  }}
                >
                  取消 [ESC]
                </button>
              </div>
            </div>
          ) : (
            <button
              className="w-full retro-button flex items-center justify-center p-4 py-6"
              onClick={() => setIsAddingUser(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              新勇者加入 [NEW PLAYER]
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserSelector;
