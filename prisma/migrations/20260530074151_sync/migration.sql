-- DropForeignKey
ALTER TABLE "materials" DROP CONSTRAINT "materials_sourceId_fkey";

-- AddForeignKey
ALTER TABLE "materials" ADD CONSTRAINT "materials_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "sources"("id") ON DELETE SET NULL ON UPDATE CASCADE;
