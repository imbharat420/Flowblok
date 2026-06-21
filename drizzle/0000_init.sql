CREATE TABLE "credentials" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"data_enc" text NOT NULL,
	"space_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_verifications" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"code_hash" text NOT NULL,
	"purpose" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scheduler_state" (
	"workflow_id" text PRIMARY KEY NOT NULL,
	"last_fired_minute" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"user_agent" text,
	"ip" text
);
--> statement-breakpoint
CREATE TABLE "spaces" (
	"id" text PRIMARY KEY NOT NULL,
	"owner_id" text NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"niche" text DEFAULT 'general' NOT NULL,
	"plan" text DEFAULT 'Professional' NOT NULL,
	"region" text DEFAULT 'us-east-1' NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"members" integer DEFAULT 1 NOT NULL,
	"archived_at" timestamp with time zone,
	"purge_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stories" (
	"id" text PRIMARY KEY NOT NULL,
	"space_id" text NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"content_type" text NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"folder" text,
	"author" text DEFAULT 'system' NOT NULL,
	"content" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "story_versions" (
	"id" text PRIMARY KEY NOT NULL,
	"story_id" text NOT NULL,
	"at" timestamp with time zone DEFAULT now() NOT NULL,
	"author" text NOT NULL,
	"label" text NOT NULL,
	"content" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"name" text NOT NULL,
	"role" text DEFAULT 'owner' NOT NULL,
	"verified" boolean DEFAULT false NOT NULL,
	"username" text,
	"first_name" text,
	"last_name" text,
	"avatar_color" text DEFAULT '#2563eb',
	"github_connected" boolean DEFAULT false NOT NULL,
	"github_email" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "workflow_runs" (
	"id" text PRIMARY KEY NOT NULL,
	"workflow_id" text NOT NULL,
	"status" text NOT NULL,
	"trigger" text NOT NULL,
	"started_at" timestamp with time zone NOT NULL,
	"finished_at" timestamp with time zone,
	"duration_ms" integer DEFAULT 0 NOT NULL,
	"node_logs" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"error" text
);
--> statement-breakpoint
CREATE TABLE "workflows" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"nodes" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"connections" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"runs" integer DEFAULT 0 NOT NULL,
	"last_run" timestamp with time zone,
	"owner_id" text,
	"space_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "credentials" ADD CONSTRAINT "credentials_space_id_spaces_id_fk" FOREIGN KEY ("space_id") REFERENCES "public"."spaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spaces" ADD CONSTRAINT "spaces_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stories" ADD CONSTRAINT "stories_space_id_spaces_id_fk" FOREIGN KEY ("space_id") REFERENCES "public"."spaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "story_versions" ADD CONSTRAINT "story_versions_story_id_stories_id_fk" FOREIGN KEY ("story_id") REFERENCES "public"."stories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_runs" ADD CONSTRAINT "workflow_runs_workflow_id_workflows_id_fk" FOREIGN KEY ("workflow_id") REFERENCES "public"."workflows"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflows" ADD CONSTRAINT "workflows_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflows" ADD CONSTRAINT "workflows_space_id_spaces_id_fk" FOREIGN KEY ("space_id") REFERENCES "public"."spaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "credentials_created_idx" ON "credentials" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "credentials_space_idx" ON "credentials" USING btree ("space_id");--> statement-breakpoint
CREATE INDEX "email_verifications_email_idx" ON "email_verifications" USING btree ("email");--> statement-breakpoint
CREATE INDEX "sessions_user_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "spaces_owner_idx" ON "spaces" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "stories_space_idx" ON "stories" USING btree ("space_id");--> statement-breakpoint
CREATE INDEX "stories_space_type_idx" ON "stories" USING btree ("space_id","content_type");--> statement-breakpoint
CREATE INDEX "story_versions_story_idx" ON "story_versions" USING btree ("story_id");--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "workflow_runs_wf_idx" ON "workflow_runs" USING btree ("workflow_id","started_at");--> statement-breakpoint
CREATE INDEX "workflows_status_idx" ON "workflows" USING btree ("status");--> statement-breakpoint
CREATE INDEX "workflows_created_idx" ON "workflows" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "workflows_space_idx" ON "workflows" USING btree ("space_id");