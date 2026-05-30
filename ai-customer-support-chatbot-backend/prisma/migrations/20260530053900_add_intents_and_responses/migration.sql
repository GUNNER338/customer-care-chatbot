-- CreateTable
CREATE TABLE "intents" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "intents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "responses" (
    "id" TEXT NOT NULL,
    "intentId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "responses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "intents_name_key" ON "intents"("name");

-- CreateIndex
CREATE INDEX "responses_intentId_idx" ON "responses"("intentId");

-- AddForeignKey
ALTER TABLE "responses" ADD CONSTRAINT "responses_intentId_fkey" FOREIGN KEY ("intentId") REFERENCES "intents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
