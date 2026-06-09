-- Replace the AuditType enum with the pentest/audit taxonomy and remap
-- existing rows to the closest new value.

ALTER TYPE "AuditType" RENAME TO "AuditType_old";

CREATE TYPE "AuditType" AS ENUM (
  'APP_PENTEST',
  'EXTERNAL_PENTEST',
  'INTERNAL_PENTEST',
  'CODE_AUDIT',
  'ARCHITECTURE_AUDIT',
  'CONFIG_AUDIT',
  'CLOUD_CONFIG_AUDIT'
);

ALTER TABLE "projects" ALTER COLUMN "auditType" DROP DEFAULT;

ALTER TABLE "projects"
  ALTER COLUMN "auditType" TYPE "AuditType"
  USING (
    CASE "auditType"::text
      WHEN 'WEB' THEN 'APP_PENTEST'
      WHEN 'INTERNAL_AD' THEN 'INTERNAL_PENTEST'
      WHEN 'LINUX' THEN 'INTERNAL_PENTEST'
      WHEN 'MOBILE' THEN 'APP_PENTEST'
      WHEN 'OTHER' THEN 'APP_PENTEST'
      ELSE 'APP_PENTEST'
    END
  )::"AuditType";

DROP TYPE "AuditType_old";
