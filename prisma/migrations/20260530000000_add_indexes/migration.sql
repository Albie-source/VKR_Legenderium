-- Add indexes for commonly filtered columns

-- materials: status filter (PUBLISHED in library/map), foreign key filters
CREATE INDEX "materials_status_idx" ON "materials"("status");
CREATE INDEX "materials_genreId_idx" ON "materials"("genreId");
CREATE INDEX "materials_regionId_idx" ON "materials"("regionId");
CREATE INDEX "materials_peopleId_idx" ON "materials"("peopleId");

-- favorites: user's bookmarks lookup
CREATE INDEX "favorites_userId_idx" ON "favorites"("userId");

-- interactive_tasks: tasks by material
CREATE INDEX "interactive_tasks_materialId_idx" ON "interactive_tasks"("materialId");

-- task_attempts: user history and task stats
CREATE INDEX "task_attempts_userId_idx" ON "task_attempts"("userId");
CREATE INDEX "task_attempts_taskId_idx" ON "task_attempts"("taskId");

-- goal_progress: user's progress lookup
CREATE INDEX "goal_progress_userId_idx" ON "goal_progress"("userId");
