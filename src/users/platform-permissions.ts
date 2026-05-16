export const PLATFORM_PERMISSION_KEYS = [
  'projects.create',
  'projects.delete',
  'reports.export',
  'templates.manage',
  'settings.access',
] as const;

export type PlatformPermissionKey = (typeof PLATFORM_PERMISSION_KEYS)[number];

export const PLATFORM_PERMISSION_LABELS: Record<PlatformPermissionKey, string> = {
  'projects.create': 'Créer des projets',
  'projects.delete': 'Supprimer ses projets',
  'reports.export': 'Exporter des rapports',
  'templates.manage': 'Gérer les templates',
  'settings.access': 'Accéder aux paramètres',
};

export const DEFAULT_PLATFORM_PERMISSIONS: Record<string, Record<PlatformPermissionKey, boolean>> = {
  SUPER_ADMIN: {
    'projects.create': true,
    'projects.delete': true,
    'reports.export': true,
    'templates.manage': true,
    'settings.access': true,
  },
  USER: {
    'projects.create': true,
    'projects.delete': false,
    'reports.export': true,
    'templates.manage': false,
    'settings.access': false,
  },
};

export function resolvePermissions(
  role: string,
  overrides: Record<string, boolean> = {},
): Record<PlatformPermissionKey, boolean> {
  const defaults = DEFAULT_PLATFORM_PERMISSIONS[role] || DEFAULT_PLATFORM_PERMISSIONS.USER;
  return { ...defaults, ...overrides } as Record<PlatformPermissionKey, boolean>;
}
