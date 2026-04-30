ALTER TABLE "documents" ADD COLUMN "share_token" varchar(255);--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_share_token_unique" UNIQUE("share_token");