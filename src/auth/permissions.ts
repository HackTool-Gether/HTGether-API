import { ProjectRole } from '@prisma/client';

export const PERMISSION_KEYS = [
  'tasks.create',
  'tasks.move',
  'tasks.delete',
  'findings.create',
  'findings.edit',
  'findings.delete',
  'scopes.create',
  'scopes.edit',
  'members.manage',
  'report.edit',
] as const;

export type PermissionKey = (typeof PERMISSION_KEYS)[number];

type PermissionDefaults = Record<ProjectRole, Record<PermissionKey, boolean>>;

export const DEFAULT_PERMISSIONS: PermissionDefaults = {
  MANAGER: {
    'tasks.create': true,
    'tasks.move': true,
    'tasks.delete': true,
    'findings.create': true,
    'findings.edit': true,
    'findings.delete': true,
    'scopes.create': true,
    'scopes.edit': true,
    'members.manage': true,
    // Project lead coordinates but does not write the report (chefferie only).
    // Can be re-granted per project via the permission overrides.
    'report.edit': false,
  },
  PENTESTER: {
    'tasks.create': true,
    'tasks.move': true,
    'tasks.delete': true,
    'findings.create': true,
    'findings.edit': true,
    'findings.delete': true,
    'scopes.create': true,
    'scopes.edit': true,
    'members.manage': false,
    'report.edit': true,
  },
  CLIENT: {
    'tasks.create': false,
    'tasks.move': false,
    'tasks.delete': false,
    'findings.create': false,
    'findings.edit': false,
    'findings.delete': false,
    'scopes.create': false,
    'scopes.edit': false,
    'members.manage': false,
    'report.edit': false,
  },
};

export function hasPermission(
  role: ProjectRole,
  permission: PermissionKey,
  overrides?: Record<string, Record<string, boolean>>,
): boolean {
  const roleOverrides = overrides?.[role];
  if (roleOverrides && permission in roleOverrides) {
    return roleOverrides[permission];
  }
  return DEFAULT_PERMISSIONS[role][permission];
}
