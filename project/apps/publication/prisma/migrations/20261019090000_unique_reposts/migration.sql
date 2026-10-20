ALTER TABLE "publications" DROP CONSTRAINT "publications_original_publication_id_fkey";
CREATE UNIQUE INDEX "publications_author_id_original_publication_id_key"
ON "publications"("author_id", "original_publication_id");
