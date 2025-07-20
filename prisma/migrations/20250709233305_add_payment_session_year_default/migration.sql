-- DropIndex
DROP INDEX "Payment_studentId_key";

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "sessionYear" TEXT NOT NULL DEFAULT 'UNKNOWN',
ALTER COLUMN "status" SET DEFAULT 'pending';

-- AlterTable
ALTER TABLE "Student" ALTER COLUMN "sessionYear" SET DATA TYPE TEXT;

-- CreateIndex
CREATE INDEX "payment_per_session_idx" ON "Payment"("studentId", "sessionYear");
