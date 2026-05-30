-- CreateTable
CREATE TABLE "conversation_entities" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "orderId" TEXT,
    "email" TEXT,
    "phoneNumber" TEXT,
    "productName" TEXT,
    "date" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversation_entities_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "conversation_entities" ADD CONSTRAINT "conversation_entities_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
