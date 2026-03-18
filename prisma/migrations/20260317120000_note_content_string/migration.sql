-- AlterTable: change Note.content from Json to String
ALTER TABLE "notes" ALTER COLUMN "content" SET DATA TYPE TEXT USING content::text;
ALTER TABLE "notes" ALTER COLUMN "content" SET DEFAULT '';
