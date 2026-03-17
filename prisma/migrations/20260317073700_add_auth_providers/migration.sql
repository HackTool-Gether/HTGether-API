-- CreateEnum
CREATE TYPE "AuthProviderType" AS ENUM ('LOCAL', 'OIDC', 'LDAP', 'SAML');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "authProvider" "AuthProviderType" NOT NULL DEFAULT 'LOCAL',
ADD COLUMN     "externalId" TEXT,
ALTER COLUMN "password" DROP NOT NULL;

-- CreateTable
CREATE TABLE "auth_providers" (
    "id" TEXT NOT NULL,
    "type" "AuthProviderType" NOT NULL,
    "name" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,
    "config" JSONB NOT NULL DEFAULT '{}',
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "auth_providers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "auth_providers_type_name_key" ON "auth_providers"("type", "name");
