ALTER TABLE "Practice" ADD COLUMN "category" TEXT NOT NULL DEFAULT 'GRAMMAR';
ALTER TABLE "Practice" ADD COLUMN "videoId" TEXT;

ALTER TABLE "Practice" ADD CONSTRAINT "Practice_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "Practice_videoId_idx" ON "Practice"("videoId");
