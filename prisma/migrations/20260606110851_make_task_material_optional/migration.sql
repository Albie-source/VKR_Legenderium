-- AlterTable: make materialId nullable on interactive_tasks
ALTER TABLE "interactive_tasks" DROP CONSTRAINT "interactive_tasks_materialId_fkey";

ALTER TABLE "interactive_tasks" ALTER COLUMN "materialId" DROP NOT NULL;

ALTER TABLE "interactive_tasks" ADD CONSTRAINT "interactive_tasks_materialId_fkey"
  FOREIGN KEY ("materialId") REFERENCES "materials"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
