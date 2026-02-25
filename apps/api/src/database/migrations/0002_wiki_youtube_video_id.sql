-- Add youtube_video_id to comm_wiki_articles
ALTER TABLE "comm_wiki_articles" ADD COLUMN IF NOT EXISTS "youtube_video_id" text;
