import { useEffect, useState } from "react";
import { AdminUser, UserRole } from "../../types";
import { adminListUsers, adminUpdateUserRole } from "../../lib/adminApi";
import { useApp } from "../../context/AppContext";
import { Card, Alert, Spinner, Select } from "../../components/ui";

const ROLES: UserRole[] = ["CUSTOMER", "VET", "ADMIN"];

export function AdminUsersPage() {
  const { accessToken, user: currentUser } = useApp();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    setLoading(true);
    setError(null);
    adminListUsers(accessToken)
      .then(setUsers)
      .catch((err) => setError(err.message || "Failed to load users."))
      .finally(() => setLoading(false));
  }, [accessToken]);

  async function handleRoleChange(targetUser: AdminUser, role: UserRole) {
    if (!accessToken) return;
    setUpdatingId(targetUser.id);
    try {
      const updated = await adminUpdateUserRole(
        accessToken,
        targetUser.id,
        role,
      );
      setUsers((prev) =>
        prev.map((u) => (u.id === targetUser.id ? updated : u)),
      );
    } catch (err: any) {
      alert(err.message || "Failed to update user role.");
    } finally {
      setUpdatingId(null);
    }
  }

  if (loading) {
    return (
      <div
        className="flex items-center justify-center py-16 text-neutral-400"
        role="status"
      >
        <Spinner className="w-6 h-6 mr-2" />
        <span className="text-sm">Loading users…</span>
      </div>
    );
  }

  if (error) {
    return <Alert variant="error">{error}</Alert>;
  }

  return (
    <Card className="p-0 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-neutral-100 text-left text-xs font-semibold text-neutral-400 uppercase tracking-wide">
            <th className="px-5 py-3">Email</th>
            <th className="px-5 py-3">Joined</th>
            <th className="px-5 py-3">Role</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const isSelf = user.id === currentUser?.id;
            return (
              <tr
                key={user.id}
                className="border-b border-neutral-50 last:border-0"
              >
                <td className="px-5 py-3 text-neutral-900 font-medium">
                  {user.email}
                </td>
                <td className="px-5 py-3 text-neutral-500">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <Select
                      size="sm"
                      value={user.role}
                      disabled={isSelf || updatingId === user.id}
                      onChange={(e) =>
                        handleRoleChange(user, e.target.value as UserRole)
                      }
                      title={
                        isSelf ? "You cannot change your own role" : undefined
                      }
                      className="border-neutral-200 bg-white disabled:bg-neutral-50"
                    >
                      {ROLES.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </Select>
                    {updatingId === user.id && (
                      <Spinner className="w-3.5 h-3.5 text-neutral-400" />
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Card>
  );
}
