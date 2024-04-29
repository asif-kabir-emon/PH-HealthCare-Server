/*
  Warnings:

  - A unique constraint covering the columns `[title]` on the table `specialities` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "specialities_title_key" ON "specialities"("title");
