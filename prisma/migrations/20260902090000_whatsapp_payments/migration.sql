ALTER TABLE "PlatformSettings" ADD COLUMN "whatsappNumber" TEXT;

ALTER TABLE "Payment" ADD COLUMN "referenceCode" TEXT;

UPDATE "Payment"
SET "referenceCode" = 'LEGACY-' || SUBSTRING("id" FROM 1 FOR 8)
WHERE "referenceCode" IS NULL;

ALTER TABLE "Payment" ALTER COLUMN "referenceCode" SET NOT NULL;

CREATE UNIQUE INDEX "Payment_referenceCode_key" ON "Payment"("referenceCode");
