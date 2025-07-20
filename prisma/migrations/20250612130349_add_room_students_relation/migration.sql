/*
  Warnings:

  - A unique constraint covering the columns `[block,number]` on the table `Room` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Room_block_number_key" ON "Room"("block", "number");
