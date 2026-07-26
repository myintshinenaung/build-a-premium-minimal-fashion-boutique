import type { AdminRole, AdminRoleAssignment } from "@/types/security";
import { ROLE_LABELS } from "@/features/security/domain/permissions";

type RolesTableProps = {
  roles: AdminRoleAssignment[];
  availableRoles: AdminRole[];
};

export function RolesTable({ roles, availableRoles }: RolesTableProps) {
  return (
    <div className="overflow-x-auto border border-line bg-white">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="bg-mist text-xs uppercase tracking-[0.18em] text-stone">
          <tr>
            <th className="px-5 py-4 font-medium">User</th>
            <th className="px-5 py-4 font-medium">Role</th>
            <th className="px-5 py-4 font-medium">Assigned</th>
            <th className="px-5 py-4 font-medium">Updated</th>
          </tr>
        </thead>
        <tbody>
          {roles.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-5 py-10 text-center text-stone">
                No explicit role assignments yet. Admin users inherit the default Admin role.
              </td>
            </tr>
          ) : (
            roles.map((role) => (
              <tr key={role.userId} className="border-t border-line">
                <td className="px-5 py-4">
                  <div className="font-medium text-ink">{role.email}</div>
                  <div className="text-xs text-stone">{role.userId}</div>
                </td>
                <td className="px-5 py-4 text-ink">{ROLE_LABELS[role.role]}</td>
                <td className="px-5 py-4 text-stone">{role.assignedBy ?? "System"}</td>
                <td className="px-5 py-4 text-stone">{new Date(role.updatedAt).toLocaleString()}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <div className="border-t border-line px-5 py-4 text-xs text-stone">
        Available roles: {availableRoles.map((role) => ROLE_LABELS[role]).join(", ")}
      </div>
    </div>
  );
}
