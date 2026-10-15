-- AlterTable
ALTER TABLE "Expense" ADD COLUMN     "strategy" TEXT NOT NULL DEFAULT 'EQUAL',
ADD COLUMN     "title" TEXT;

-- AlterTable
ALTER TABLE "ExpenseSplit" DROP CONSTRAINT "ExpenseSplit_pkey",
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "percent" INTEGER,
ADD CONSTRAINT "ExpenseSplit_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "ExpenseSplit_expenseId_userId_key" ON "ExpenseSplit"("expenseId", "userId");