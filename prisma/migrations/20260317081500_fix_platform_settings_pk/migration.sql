-- Fix: use "key" as primary key instead of "id"
DELETE FROM "platform_settings";

ALTER TABLE "platform_settings" DROP CONSTRAINT "platform_settings_pkey";
ALTER TABLE "platform_settings" DROP COLUMN "id";
ALTER TABLE "platform_settings" DROP CONSTRAINT IF EXISTS "platform_settings_key_key";
ALTER TABLE "platform_settings" ADD CONSTRAINT "platform_settings_pkey" PRIMARY KEY ("key");
