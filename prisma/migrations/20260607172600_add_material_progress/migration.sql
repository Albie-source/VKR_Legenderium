-- CreateTable
CREATE TABLE "material_progress" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "materialId" INTEGER NOT NULL,
    "discoveredAt" TIMESTAMP(3),
    "restoredAt" TIMESTAMP(3),

    CONSTRAINT "material_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "material_progress_userId_idx" ON "material_progress"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "material_progress_userId_materialId_key" ON "material_progress"("userId", "materialId");

-- AddForeignKey
ALTER TABLE "material_progress" ADD CONSTRAINT "material_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "material_progress" ADD CONSTRAINT "material_progress_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "materials"("id") ON DELETE CASCADE ON UPDATE CASCADE;
