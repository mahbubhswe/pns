-- Online membership payments (SSLCommerz).
ALTER TYPE "PaymentMethod" ADD VALUE 'ONLINE';

CREATE TYPE "PaymentStatus" AS ENUM ('UNPAID', 'PAID', 'FAILED');

ALTER TABLE "User"
  ADD COLUMN "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'UNPAID',
  ADD COLUMN "paymentTranId" TEXT,
  ADD COLUMN "paymentValId" TEXT,
  ADD COLUMN "paymentChannel" TEXT,
  ADD COLUMN "paidAt" TIMESTAMP(3);

-- Every existing application used manual bKash/bank payment (checked by the committee).
UPDATE "User" SET "paymentStatus" = 'PAID';

CREATE UNIQUE INDEX "User_paymentTranId_key" ON "User"("paymentTranId");
