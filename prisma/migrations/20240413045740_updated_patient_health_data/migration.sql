/*
  Warnings:

  - The `recentAnxiety` column on the `patient_health_data` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `recentDepression` column on the `patient_health_data` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "patient_health_data" ALTER COLUMN "dateOfBirth" SET DATA TYPE TEXT,
ALTER COLUMN "hasAllergies" DROP NOT NULL,
ALTER COLUMN "hasAllergies" SET DEFAULT false,
ALTER COLUMN "hasDisease" DROP NOT NULL,
ALTER COLUMN "hasDisease" SET DEFAULT false,
ALTER COLUMN "smokingStatus" DROP NOT NULL,
ALTER COLUMN "smokingStatus" SET DEFAULT false,
ALTER COLUMN "dietaryPreferences" DROP NOT NULL,
ALTER COLUMN "pregnancyStatus" DROP NOT NULL,
ALTER COLUMN "pregnancyStatus" SET DEFAULT false,
ALTER COLUMN "mentalHealthHistory" DROP NOT NULL,
ALTER COLUMN "immunizationStatus" DROP NOT NULL,
ALTER COLUMN "hasPastSurgeries" DROP NOT NULL,
ALTER COLUMN "hasPastSurgeries" SET DEFAULT false,
DROP COLUMN "recentAnxiety",
ADD COLUMN     "recentAnxiety" BOOLEAN DEFAULT false,
DROP COLUMN "recentDepression",
ADD COLUMN     "recentDepression" BOOLEAN DEFAULT false,
ALTER COLUMN "maritalStatus" DROP NOT NULL,
ALTER COLUMN "maritalStatus" SET DEFAULT 'UNMARRIED';
