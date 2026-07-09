CREATE TABLE "health" (
	"id" serial PRIMARY KEY NOT NULL,
	"data" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "health" ENABLE ROW LEVEL SECURITY;