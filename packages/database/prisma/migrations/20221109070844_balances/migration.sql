/*
  Warnings:

  - The values [bank_account] on the enum `SourceType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "SourceType_new" AS ENUM ('debit_card', 'credit_card', 'checking_account', 'savings_account');
ALTER TABLE "Source" ALTER COLUMN "type" TYPE "SourceType_new" USING ("type"::text::"SourceType_new");
ALTER TYPE "SourceType" RENAME TO "SourceType_old";
ALTER TYPE "SourceType_new" RENAME TO "SourceType";
DROP TYPE "SourceType_old";
COMMIT;

-- AlterTable
ALTER TABLE "Source" ADD COLUMN     "balance" INTEGER NOT NULL DEFAULT 0;
