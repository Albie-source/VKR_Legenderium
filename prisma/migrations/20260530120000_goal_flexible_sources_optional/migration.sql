-- Make sourceId nullable in materials
ALTER TABLE "materials" ALTER COLUMN "sourceId" DROP NOT NULL;

-- Add optional regionId to goals
ALTER TABLE "goals" ADD COLUMN "regionId" INTEGER;

-- Create goal_genres junction table
CREATE TABLE "goal_genres" (
    "goalId" INTEGER NOT NULL,
    "genreId" INTEGER NOT NULL,
    CONSTRAINT "goal_genres_pkey" PRIMARY KEY ("goalId","genreId")
);

-- Create goal_topics junction table
CREATE TABLE "goal_topics" (
    "goalId" INTEGER NOT NULL,
    "topicId" INTEGER NOT NULL,
    CONSTRAINT "goal_topics_pkey" PRIMARY KEY ("goalId","topicId")
);

-- Create goal_materials junction table
CREATE TABLE "goal_materials" (
    "goalId" INTEGER NOT NULL,
    "materialId" INTEGER NOT NULL,
    CONSTRAINT "goal_materials_pkey" PRIMARY KEY ("goalId","materialId")
);

-- Migrate existing genre/topic data before dropping columns
INSERT INTO "goal_genres" ("goalId", "genreId")
SELECT "id", "genreId" FROM "goals" WHERE "genreId" IS NOT NULL;

INSERT INTO "goal_topics" ("goalId", "topicId")
SELECT "id", "topicId" FROM "goals" WHERE "topicId" IS NOT NULL;

-- Drop old single-value columns
ALTER TABLE "goals" DROP COLUMN "genreId";
ALTER TABLE "goals" DROP COLUMN "topicId";

-- Add foreign key constraints
ALTER TABLE "goals" ADD CONSTRAINT "goals_regionId_fkey"
    FOREIGN KEY ("regionId") REFERENCES "regions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "goal_genres" ADD CONSTRAINT "goal_genres_goalId_fkey"
    FOREIGN KEY ("goalId") REFERENCES "goals"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "goal_genres" ADD CONSTRAINT "goal_genres_genreId_fkey"
    FOREIGN KEY ("genreId") REFERENCES "genres"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "goal_topics" ADD CONSTRAINT "goal_topics_goalId_fkey"
    FOREIGN KEY ("goalId") REFERENCES "goals"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "goal_topics" ADD CONSTRAINT "goal_topics_topicId_fkey"
    FOREIGN KEY ("topicId") REFERENCES "topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "goal_materials" ADD CONSTRAINT "goal_materials_goalId_fkey"
    FOREIGN KEY ("goalId") REFERENCES "goals"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "goal_materials" ADD CONSTRAINT "goal_materials_materialId_fkey"
    FOREIGN KEY ("materialId") REFERENCES "materials"("id") ON DELETE CASCADE ON UPDATE CASCADE;
