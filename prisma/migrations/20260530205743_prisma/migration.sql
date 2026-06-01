-- AlterTable
ALTER TABLE "properties" ADD COLUMN     "is_featured" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "properties_is_featured_deleted_at_idx" ON "properties"("is_featured", "deleted_at");
