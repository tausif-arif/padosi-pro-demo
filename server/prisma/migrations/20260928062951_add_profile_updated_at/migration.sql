/*
  Warnings:

  - Added the required column `updated_at` to the `profiles` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "profiles" ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;
