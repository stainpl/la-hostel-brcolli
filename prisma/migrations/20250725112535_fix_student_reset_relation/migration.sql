-- CreateTable
CREATE TABLE "StudentReset" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudentReset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StudentReset_token_key" ON "StudentReset"("token");

-- AddForeignKey
ALTER TABLE "StudentReset" ADD CONSTRAINT "StudentReset_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
