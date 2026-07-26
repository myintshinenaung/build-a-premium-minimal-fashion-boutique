import type { AdminRole, PermissionKey } from "@/types/security";
import { PERMISSION_MODULE_LABELS } from "@/features/security/domain/security-schemas";
import { ROLE_LABELS } from "@/features/security/domain/permissions";

type PermissionsMatrixProps = {
  matrix: Record<AdminRole, PermissionKey[]>;
};

function formatPermission(permission: PermissionKey) {
  const [module, action] = permission.split(":");
  const label = PERMISSION_MODULE_LABELS[module as keyof typeof PERMISSION_MODULE_LABELS] ?? module;
  return `${label} · ${action}`;
}

export function PermissionsMatrix({ matrix }: PermissionsMatrixProps) {
  const roles = Object.keys(matrix).filter((role) => role !== "customer") as AdminRole[];

  return (
    <div className="overflow-x-auto border border-line bg-white">
      <table className="w-full min-w-[980px] text-left text-sm">
        <thead className="bg-mist text-xs uppercase tracking-[0.18em] text-stone">
          <tr>
            <th className="px-5 py-4 font-medium">Role</th>
            <th className="px-5 py-4 font-medium">Granted Permissions</th>
          </tr>
        </thead>
        <tbody>
          {roles.map((role) => (
            <tr key={role} className="border-t border-line align-top">
              <td className="px-5 py-4 font-medium text-ink">{ROLE_LABELS[role]}</td>
              <td className="px-5 py-4">
                <div className="flex flex-wrap gap-2">
                  {matrix[role].length === 0 ? (
                    <span className="text-stone">No permissions</span>
                  ) : (
                    matrix[role].map((permission) => (
                      <span key={permission} className="rounded-full bg-mist px-3 py-1 text-xs text-ink">
                        {formatPermission(permission)}
                      </span>
                    ))
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
