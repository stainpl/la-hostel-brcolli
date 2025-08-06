/*
  Warnings:

  - You are about to drop the column `action` on the `Log` table. All the data in the column will be lost.
  - You are about to drop the column `actor` on the `Log` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Log` table. All the data in the column will be lost.
  - You are about to drop the column `meta` on the `Log` table. All the data in the column will be lost.
  - Added the required column `level` to the `Log` table without a default value. This is not possible if the table is not empty.
  - Added the required column `message` to the `Log` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "LogLevel" AS ENUM ('DEBUG', 'INFO', 'WARN', 'ERROR');

-- AlterTable
ALTER TABLE "Log" DROP COLUMN "action",
DROP COLUMN "actor",
DROP COLUMN "createdAt",
DROP COLUMN "meta",
ADD COLUMN     "context" TEXT,
ADD COLUMN     "level" "LogLevel" NOT NULL,
ADD COLUMN     "message" TEXT NOT NULL,
ADD COLUMN     "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
