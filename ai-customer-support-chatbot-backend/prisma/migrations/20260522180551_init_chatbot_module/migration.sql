/*
  Warnings:

  - The `status` column on the `conversations` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `sender` on the `messages` table. All the data in the column will be lost.
  - Added the required column `senderType` to the `messages` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ConversationStatus" AS ENUM ('ACTIVE', 'CLOSED', 'ESCALATED');

-- CreateEnum
CREATE TYPE "SenderType" AS ENUM ('USER', 'BOT', 'AGENT');

-- AlterTable
ALTER TABLE "conversations" ADD COLUMN     "customerId" TEXT,
DROP COLUMN "status",
ADD COLUMN     "status" "ConversationStatus" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "messages" DROP COLUMN "sender",
ADD COLUMN     "senderId" TEXT,
ADD COLUMN     "senderType" "SenderType" NOT NULL;
