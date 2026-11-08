-- Who can read a published post: everyone, logged-in members, or staff only.
-- Additive: existing posts keep their current behaviour as PUBLIC.
CREATE TYPE "PostAudience" AS ENUM ('PUBLIC', 'MEMBERS', 'STAFF');

ALTER TABLE "Post" ADD COLUMN "audience" "PostAudience" NOT NULL DEFAULT 'PUBLIC';
