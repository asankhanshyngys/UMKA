CREATE TYPE "PaymentAccessType" AS ENUM ('COURSE', 'MODULE', 'VIDEO', 'SUBSCRIPTION');

ALTER TABLE "Payment"
  ADD COLUMN "accessType" "PaymentAccessType",
  ADD COLUMN "accessId" TEXT,
  ADD COLUMN "refundedAt" TIMESTAMP(3),
  ADD COLUMN "refundReason" TEXT;

CREATE INDEX "Payment_userId_status_idx" ON "Payment"("userId", "status");
