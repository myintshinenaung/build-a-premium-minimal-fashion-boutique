import { createRepositoryError } from "@/lib/repositories/supabase-errors";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  AdminAuditLogRow,
  AdminLoginHistoryRow,
  AdminRolePermissionRow,
  AdminSessionRow,
  AdminUserRoleRow
} from "@/lib/supabase/types";
import type {
  AdminRole,
  AdminRoleAssignment,
  AdminSessionRecord,
  AuditAction,
  AuditLogEntry,
  LoginHistoryEntry,
  PermissionKey,
  RolePermission
} from "@/types/security";
import { normalizeAdminRole } from "@/features/security/domain/permissions";

function createSecurityId(prefix: string) {
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${suffix}`;
}

function roleFromRow(row: AdminUserRoleRow): AdminRoleAssignment {
  return {
    userId: row.user_id,
    email: row.email,
    role: normalizeAdminRole(row.role),
    assignedBy: row.assigned_by,
    assignedAt: row.assigned_at,
    updatedAt: row.updated_at
  };
}

function permissionFromRow(row: AdminRolePermissionRow): RolePermission {
  return {
    role: normalizeAdminRole(row.role),
    permission: row.permission as PermissionKey,
    allowed: row.allowed
  };
}

function auditFromRow(row: AdminAuditLogRow): AuditLogEntry {
  return {
    id: row.id,
    userId: row.user_id,
    userName: row.user_name,
    userEmail: row.user_email,
    action: row.action as AuditAction,
    resource: row.resource,
    resourceId: row.resource_id,
    details: row.details ?? {},
    ipAddress: row.ip_address,
    userAgent: row.user_agent,
    createdAt: row.created_at
  };
}

function sessionFromRow(row: AdminSessionRow, currentSessionToken?: string | null): AdminSessionRecord {
  return {
    id: row.id,
    userId: row.user_id,
    userEmail: row.user_email,
    sessionToken: row.session_token,
    deviceLabel: row.device_label,
    ipAddress: row.ip_address,
    userAgent: row.user_agent,
    lastSeenAt: row.last_seen_at,
    expiresAt: row.expires_at,
    revokedAt: row.revoked_at,
    createdAt: row.created_at,
    isCurrent: currentSessionToken ? row.session_token === currentSessionToken : undefined
  };
}

function loginHistoryFromRow(row: AdminLoginHistoryRow): LoginHistoryEntry {
  return {
    id: row.id,
    userId: row.user_id,
    userEmail: row.user_email,
    success: row.success,
    ipAddress: row.ip_address,
    userAgent: row.user_agent,
    deviceLabel: row.device_label,
    failureReason: row.failure_reason,
    createdAt: row.created_at
  };
}

export const roleRepository = {
  async getByUserId(userId: string) {
    try {
      const supabase = createSupabaseServerClient();
      const { data, error } = await supabase.from("admin_user_roles").select("*").eq("user_id", userId).maybeSingle();

      if (error) {
        throw error;
      }

      return data ? roleFromRow(data) : null;
    } catch (error) {
      throw createRepositoryError("Unable to load admin role", error);
    }
  },

  async list() {
    try {
      const supabase = createSupabaseServerClient();
      const { data, error } = await supabase.from("admin_user_roles").select("*").order("updated_at", { ascending: false });

      if (error) {
        throw error;
      }

      return (data ?? []).map(roleFromRow);
    } catch (error) {
      throw createRepositoryError("Unable to load admin roles", error);
    }
  },

  async upsert(input: {
    userId: string;
    email: string;
    role: AdminRole;
    assignedBy?: string | null;
  }) {
    try {
      const supabase = createSupabaseServerClient();
      const timestamp = new Date().toISOString();
      const { data, error } = await supabase
        .from("admin_user_roles")
        .upsert(
          {
            user_id: input.userId,
            email: input.email,
            role: input.role,
            assigned_by: input.assignedBy ?? null,
            updated_at: timestamp
          },
          { onConflict: "user_id" }
        )
        .select("*")
        .single();

      if (error) {
        throw error;
      }

      return roleFromRow(data);
    } catch (error) {
      throw createRepositoryError("Unable to update admin role", error);
    }
  }
};

export const permissionRepository = {
  async listOverrides() {
    try {
      const supabase = createSupabaseServerClient();
      const { data, error } = await supabase.from("admin_role_permissions").select("*");

      if (error) {
        throw error;
      }

      return (data ?? []).map(permissionFromRow);
    } catch (error) {
      throw createRepositoryError("Unable to load role permissions", error);
    }
  },

  async upsertMany(role: AdminRole, permissions: Array<{ permission: PermissionKey; allowed: boolean }>) {
    try {
      const supabase = createSupabaseServerClient();
      const timestamp = new Date().toISOString();
      const rows = permissions.map((entry) => ({
        role,
        permission: entry.permission,
        allowed: entry.allowed,
        updated_at: timestamp
      }));

      const { error } = await supabase.from("admin_role_permissions").upsert(rows, { onConflict: "role,permission" });

      if (error) {
        throw error;
      }
    } catch (error) {
      throw createRepositoryError("Unable to update role permissions", error);
    }
  }
};

export const auditRepository = {
  async create(input: {
    userId?: string | null;
    userName: string;
    userEmail?: string | null;
    action: AuditAction;
    resource: string;
    resourceId?: string | null;
    details?: Record<string, unknown>;
    ipAddress?: string | null;
    userAgent?: string | null;
  }) {
    try {
      const supabase = createSupabaseServerClient();
      const { data, error } = await supabase
        .from("admin_audit_logs")
        .insert({
          id: createSecurityId("AUD"),
          user_id: input.userId ?? null,
          user_name: input.userName,
          user_email: input.userEmail ?? null,
          action: input.action,
          resource: input.resource,
          resource_id: input.resourceId ?? null,
          details: input.details ?? {},
          ip_address: input.ipAddress ?? null,
          user_agent: input.userAgent ?? null
        })
        .select("*")
        .single();

      if (error) {
        throw error;
      }

      return auditFromRow(data);
    } catch (error) {
      throw createRepositoryError("Unable to record audit log", error);
    }
  },

  async list(params: {
    page: number;
    pageSize: number;
    action?: AuditAction;
    resource?: string;
    userId?: string;
    from?: string;
    to?: string;
  }) {
    try {
      const supabase = createSupabaseServerClient();
      const from = (params.page - 1) * params.pageSize;
      const to = from + params.pageSize - 1;

      let query = supabase.from("admin_audit_logs").select("*", { count: "exact" }).order("created_at", { ascending: false });

      if (params.action) {
        query = query.eq("action", params.action);
      }

      if (params.resource) {
        query = query.eq("resource", params.resource);
      }

      if (params.userId) {
        query = query.eq("user_id", params.userId);
      }

      if (params.from) {
        query = query.gte("created_at", `${params.from}T00:00:00.000Z`);
      }

      if (params.to) {
        query = query.lte("created_at", `${params.to}T23:59:59.999Z`);
      }

      const { data, error, count } = await query.range(from, to);

      if (error) {
        throw error;
      }

      const total = count ?? 0;

      return {
        items: (data ?? []).map(auditFromRow),
        total,
        page: params.page,
        pageSize: params.pageSize,
        totalPages: Math.max(1, Math.ceil(total / params.pageSize))
      };
    } catch (error) {
      throw createRepositoryError("Unable to load audit logs", error);
    }
  }
};

export const sessionRepository = {
  async create(input: {
    userId: string;
    userEmail: string;
    sessionToken: string;
    deviceLabel: string;
    ipAddress?: string | null;
    userAgent?: string | null;
    expiresAt: string;
  }) {
    try {
      const supabase = createSupabaseServerClient();
      const { data, error } = await supabase
        .from("admin_sessions")
        .insert({
          id: createSecurityId("SES"),
          user_id: input.userId,
          user_email: input.userEmail,
          session_token: input.sessionToken,
          device_label: input.deviceLabel,
          ip_address: input.ipAddress ?? null,
          user_agent: input.userAgent ?? null,
          expires_at: input.expiresAt,
          revoked_at: null
        })
        .select("*")
        .single();

      if (error) {
        throw error;
      }

      return sessionFromRow(data);
    } catch (error) {
      throw createRepositoryError("Unable to create admin session", error);
    }
  },

  async touch(sessionToken: string) {
    try {
      const supabase = createSupabaseServerClient();
      const { error } = await supabase
        .from("admin_sessions")
        .update({ last_seen_at: new Date().toISOString() })
        .eq("session_token", sessionToken)
        .is("revoked_at", null);

      if (error) {
        throw error;
      }
    } catch (error) {
      throw createRepositoryError("Unable to update admin session", error);
    }
  },

  async listActive(currentSessionToken?: string | null) {
    try {
      const supabase = createSupabaseServerClient();
      const { data, error } = await supabase
        .from("admin_sessions")
        .select("*")
        .is("revoked_at", null)
        .gte("expires_at", new Date().toISOString())
        .order("last_seen_at", { ascending: false });

      if (error) {
        throw error;
      }

      return {
        items: (data ?? []).map((row) => sessionFromRow(row, currentSessionToken)),
        total: data?.length ?? 0
      };
    } catch (error) {
      throw createRepositoryError("Unable to load active sessions", error);
    }
  },

  async revoke(sessionId: string) {
    try {
      const supabase = createSupabaseServerClient();
      const { data, error } = await supabase
        .from("admin_sessions")
        .update({ revoked_at: new Date().toISOString() })
        .eq("id", sessionId)
        .select("*")
        .single();

      if (error) {
        throw error;
      }

      return sessionFromRow(data);
    } catch (error) {
      throw createRepositoryError("Unable to revoke admin session", error);
    }
  }
};

export const loginHistoryRepository = {
  async create(input: {
    userId?: string | null;
    userEmail: string;
    success: boolean;
    ipAddress?: string | null;
    userAgent?: string | null;
    deviceLabel?: string | null;
    failureReason?: string | null;
  }) {
    try {
      const supabase = createSupabaseServerClient();
      const { data, error } = await supabase
        .from("admin_login_history")
        .insert({
          id: createSecurityId("LOG"),
          user_id: input.userId ?? null,
          user_email: input.userEmail,
          success: input.success,
          ip_address: input.ipAddress ?? null,
          user_agent: input.userAgent ?? null,
          device_label: input.deviceLabel ?? null,
          failure_reason: input.failureReason ?? null
        })
        .select("*")
        .single();

      if (error) {
        throw error;
      }

      return loginHistoryFromRow(data);
    } catch (error) {
      throw createRepositoryError("Unable to record login history", error);
    }
  },

  async list(params: { page: number; pageSize: number; userId?: string }) {
    try {
      const supabase = createSupabaseServerClient();
      const from = (params.page - 1) * params.pageSize;
      const to = from + params.pageSize - 1;

      let query = supabase.from("admin_login_history").select("*", { count: "exact" }).order("created_at", { ascending: false });

      if (params.userId) {
        query = query.eq("user_id", params.userId);
      }

      const { data, error, count } = await query.range(from, to);

      if (error) {
        throw error;
      }

      const total = count ?? 0;

      return {
        items: (data ?? []).map(loginHistoryFromRow),
        total,
        page: params.page,
        pageSize: params.pageSize,
        totalPages: Math.max(1, Math.ceil(total / params.pageSize))
      };
    } catch (error) {
      throw createRepositoryError("Unable to load login history", error);
    }
  }
};
