/*
  Warnings:

  - A unique constraint covering the columns `[block,number,gender]` on the table `Room` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Room_block_number_key";

-- CreateIndex
CREATE UNIQUE INDEX "Room_block_number_gender_key" ON "Room"("block", "number", "gender");
