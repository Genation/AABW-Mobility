CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE "track_4_suggestion_embeddings" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "track_4_suggestion_embeddings_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"display_text" text NOT NULL,
	"query_type" varchar(100) DEFAULT 'Discovery Search',
	"embedding" vector(384) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "track_4_suggestion_embeddings" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
-- IVFFlat index for cosine similarity search (build after populating data)
CREATE INDEX IF NOT EXISTS idx_track_4_embedding_cosine
  ON "track_4_suggestion_embeddings"
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);