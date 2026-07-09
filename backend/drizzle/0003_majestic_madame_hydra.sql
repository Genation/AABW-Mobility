CREATE TABLE "track_4_abbreviations" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "track_4_abbreviations_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"abbreviation" varchar(50) NOT NULL,
	"expanded_form" varchar(255) NOT NULL,
	"type" varchar(50) NOT NULL,
	"is_generated" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "track_4_autocomplete_entries" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "track_4_autocomplete_entries_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"original_id" varchar(20) NOT NULL,
	"input_prefix" text NOT NULL,
	"suggestion_text" text NOT NULL,
	"suggestion_type" varchar(50) NOT NULL,
	"score" numeric(4, 3) NOT NULL,
	"query_frequency" integer,
	"is_generated" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "track_4_evaluations" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "track_4_evaluations_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"original_id" varchar(20) NOT NULL,
	"input_prefix" text NOT NULL,
	"expected_suggestion_type" varchar(100),
	"expected_top_suggestions" jsonb,
	"difficulty" varchar(20),
	"skills_tested" text,
	"is_generated" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "track_4_pois" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "track_4_pois_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"original_id" varchar(20) NOT NULL,
	"poi_name" text NOT NULL,
	"category" varchar(100),
	"brand" varchar(100),
	"address" text,
	"city" varchar(100),
	"latitude" numeric(10, 7),
	"longitude" numeric(10, 7),
	"rating" numeric(3, 2),
	"review_count" integer,
	"popularity_score" integer,
	"tags" jsonb,
	"is_generated" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "track_4_popular_queries" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "track_4_popular_queries_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"original_id" varchar(20) NOT NULL,
	"query_text" text NOT NULL,
	"intent_type" varchar(50) NOT NULL,
	"monthly_frequency" integer NOT NULL,
	"region" varchar(100),
	"is_generated" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "idx_track_4_abbr_type" ON "track_4_abbreviations" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_track_4_ac_prefix" ON "track_4_autocomplete_entries" USING btree ("input_prefix");--> statement-breakpoint
CREATE INDEX "idx_track_4_ac_type" ON "track_4_autocomplete_entries" USING btree ("suggestion_type");--> statement-breakpoint
CREATE INDEX "idx_track_4_eval_difficulty" ON "track_4_evaluations" USING btree ("difficulty");--> statement-breakpoint
CREATE INDEX "idx_track_4_pois_category" ON "track_4_pois" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_track_4_pois_brand" ON "track_4_pois" USING btree ("brand");--> statement-breakpoint
CREATE INDEX "idx_track_4_pois_city" ON "track_4_pois" USING btree ("city");--> statement-breakpoint
CREATE INDEX "idx_track_4_pq_region" ON "track_4_popular_queries" USING btree ("region");--> statement-breakpoint
CREATE INDEX "idx_track_4_pq_intent" ON "track_4_popular_queries" USING btree ("intent_type");