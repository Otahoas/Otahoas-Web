import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  DO $$ BEGIN
    CREATE TYPE "public"."enum_pages_blocks_calendar_embed_default_view" AS ENUM('month', 'week', 'schedule');
  EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN
    CREATE TYPE "public"."enum_pages_blocks_content_with_banner_items_link_type" AS ENUM('reference', 'custom');
  EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN
    CREATE TYPE "public"."enum_pages_blocks_content_with_banner_width_ratio" AS ENUM('balanced', 'contentWide', 'bannerWide');
  EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN
    CREATE TYPE "public"."enum__pages_v_blocks_calendar_embed_default_view" AS ENUM('month', 'week', 'schedule');
  EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN
    CREATE TYPE "public"."enum__pages_v_blocks_content_with_banner_items_link_type" AS ENUM('reference', 'custom');
  EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN
    CREATE TYPE "public"."enum__pages_v_blocks_content_with_banner_width_ratio" AS ENUM('balanced', 'contentWide', 'bannerWide');
  EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  CREATE TABLE IF NOT EXISTS "pages_blocks_content_with_banner_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"enable_link" boolean DEFAULT false,
  	"link_type" "enum_pages_blocks_content_with_banner_items_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "pages_blocks_content_with_banner_items_locales" (
  	"title" varchar,
  	"rich_text" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "pages_blocks_content_with_banner" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"width_ratio" "enum_pages_blocks_content_with_banner_width_ratio" DEFAULT 'balanced',
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "pages_blocks_posts_carousel" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"limit" numeric DEFAULT 9,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "pages_blocks_posts_carousel_locales" (
  	"title" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "_pages_v_blocks_content_with_banner_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"enable_link" boolean DEFAULT false,
  	"link_type" "enum__pages_v_blocks_content_with_banner_items_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_pages_v_blocks_content_with_banner_items_locales" (
  	"title" varchar,
  	"rich_text" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "_pages_v_blocks_content_with_banner" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"width_ratio" "enum__pages_v_blocks_content_with_banner_width_ratio" DEFAULT 'balanced',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_pages_v_blocks_posts_carousel" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"limit" numeric DEFAULT 9,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_pages_v_blocks_posts_carousel_locales" (
  	"title" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "pages_blocks_calendar_embed" ADD COLUMN IF NOT EXISTS "default_view" "enum_pages_blocks_calendar_embed_default_view" DEFAULT 'month';
  ALTER TABLE "pages_blocks_tilat" ADD COLUMN IF NOT EXISTS "anchor_id" varchar;
  ALTER TABLE "pages_blocks_image_scroller" ADD COLUMN IF NOT EXISTS "show_title" boolean DEFAULT true;
  ALTER TABLE "_pages_v_blocks_calendar_embed" ADD COLUMN IF NOT EXISTS "default_view" "enum__pages_v_blocks_calendar_embed_default_view" DEFAULT 'month';
  ALTER TABLE "_pages_v_blocks_tilat" ADD COLUMN IF NOT EXISTS "anchor_id" varchar;
  ALTER TABLE "_pages_v_blocks_image_scroller" ADD COLUMN IF NOT EXISTS "show_title" boolean DEFAULT true;
  ALTER TABLE "posts_locales" ADD COLUMN IF NOT EXISTS "abstract" varchar;
  ALTER TABLE "_posts_v_locales" ADD COLUMN IF NOT EXISTS "version_abstract" varchar;
  DO $$ BEGIN
    ALTER TABLE "pages_blocks_content_with_banner_items" ADD CONSTRAINT "pages_blocks_content_with_banner_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN
    ALTER TABLE "pages_blocks_content_with_banner_items" ADD CONSTRAINT "pages_blocks_content_with_banner_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_content_with_banner"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN
    ALTER TABLE "pages_blocks_content_with_banner_items_locales" ADD CONSTRAINT "pages_blocks_content_with_banner_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_content_with_banner_items"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN
    ALTER TABLE "pages_blocks_content_with_banner" ADD CONSTRAINT "pages_blocks_content_with_banner_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN
    ALTER TABLE "pages_blocks_posts_carousel" ADD CONSTRAINT "pages_blocks_posts_carousel_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN
    ALTER TABLE "pages_blocks_posts_carousel_locales" ADD CONSTRAINT "pages_blocks_posts_carousel_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_posts_carousel"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN
    ALTER TABLE "_pages_v_blocks_content_with_banner_items" ADD CONSTRAINT "_pages_v_blocks_content_with_banner_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN
    ALTER TABLE "_pages_v_blocks_content_with_banner_items" ADD CONSTRAINT "_pages_v_blocks_content_with_banner_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_content_with_banner"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN
    ALTER TABLE "_pages_v_blocks_content_with_banner_items_locales" ADD CONSTRAINT "_pages_v_blocks_content_with_banner_items_locales_parent__fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_content_with_banner_items"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN
    ALTER TABLE "_pages_v_blocks_content_with_banner" ADD CONSTRAINT "_pages_v_blocks_content_with_banner_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN
    ALTER TABLE "_pages_v_blocks_posts_carousel" ADD CONSTRAINT "_pages_v_blocks_posts_carousel_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN
    ALTER TABLE "_pages_v_blocks_posts_carousel_locales" ADD CONSTRAINT "_pages_v_blocks_posts_carousel_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_posts_carousel"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  CREATE INDEX IF NOT EXISTS "pages_blocks_content_with_banner_items_order_idx" ON "pages_blocks_content_with_banner_items" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "pages_blocks_content_with_banner_items_parent_id_idx" ON "pages_blocks_content_with_banner_items" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "pages_blocks_content_with_banner_items_image_idx" ON "pages_blocks_content_with_banner_items" USING btree ("image_id");
  CREATE UNIQUE INDEX IF NOT EXISTS "pages_blocks_content_with_banner_items_locales_locale_parent" ON "pages_blocks_content_with_banner_items_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX IF NOT EXISTS "pages_blocks_content_with_banner_order_idx" ON "pages_blocks_content_with_banner" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "pages_blocks_content_with_banner_parent_id_idx" ON "pages_blocks_content_with_banner" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "pages_blocks_content_with_banner_path_idx" ON "pages_blocks_content_with_banner" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "pages_blocks_posts_carousel_order_idx" ON "pages_blocks_posts_carousel" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "pages_blocks_posts_carousel_parent_id_idx" ON "pages_blocks_posts_carousel" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "pages_blocks_posts_carousel_path_idx" ON "pages_blocks_posts_carousel" USING btree ("_path");
  CREATE UNIQUE INDEX IF NOT EXISTS "pages_blocks_posts_carousel_locales_locale_parent_id_unique" ON "pages_blocks_posts_carousel_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX IF NOT EXISTS "_pages_v_blocks_content_with_banner_items_order_idx" ON "_pages_v_blocks_content_with_banner_items" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_pages_v_blocks_content_with_banner_items_parent_id_idx" ON "_pages_v_blocks_content_with_banner_items" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_pages_v_blocks_content_with_banner_items_image_idx" ON "_pages_v_blocks_content_with_banner_items" USING btree ("image_id");
  CREATE UNIQUE INDEX IF NOT EXISTS "_pages_v_blocks_content_with_banner_items_locales_locale_par" ON "_pages_v_blocks_content_with_banner_items_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX IF NOT EXISTS "_pages_v_blocks_content_with_banner_order_idx" ON "_pages_v_blocks_content_with_banner" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_pages_v_blocks_content_with_banner_parent_id_idx" ON "_pages_v_blocks_content_with_banner" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_pages_v_blocks_content_with_banner_path_idx" ON "_pages_v_blocks_content_with_banner" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "_pages_v_blocks_posts_carousel_order_idx" ON "_pages_v_blocks_posts_carousel" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_pages_v_blocks_posts_carousel_parent_id_idx" ON "_pages_v_blocks_posts_carousel" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_pages_v_blocks_posts_carousel_path_idx" ON "_pages_v_blocks_posts_carousel" USING btree ("_path");
  CREATE UNIQUE INDEX IF NOT EXISTS "_pages_v_blocks_posts_carousel_locales_locale_parent_id_uniq" ON "_pages_v_blocks_posts_carousel_locales" USING btree ("_locale","_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_content_with_banner_items" CASCADE;
  DROP TABLE "pages_blocks_content_with_banner_items_locales" CASCADE;
  DROP TABLE "pages_blocks_content_with_banner" CASCADE;
  DROP TABLE "pages_blocks_posts_carousel" CASCADE;
  DROP TABLE "pages_blocks_posts_carousel_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_content_with_banner_items" CASCADE;
  DROP TABLE "_pages_v_blocks_content_with_banner_items_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_content_with_banner" CASCADE;
  DROP TABLE "_pages_v_blocks_posts_carousel" CASCADE;
  DROP TABLE "_pages_v_blocks_posts_carousel_locales" CASCADE;
  ALTER TABLE "pages_blocks_calendar_embed" DROP COLUMN "default_view";
  ALTER TABLE "pages_blocks_image_scroller" DROP COLUMN "show_title";
  ALTER TABLE "pages_blocks_tilat" DROP COLUMN "anchor_id";
  ALTER TABLE "_pages_v_blocks_calendar_embed" DROP COLUMN "default_view";
  ALTER TABLE "_pages_v_blocks_image_scroller" DROP COLUMN "show_title";
  ALTER TABLE "_pages_v_blocks_tilat" DROP COLUMN "anchor_id";
  ALTER TABLE "posts_locales" DROP COLUMN "abstract";
  ALTER TABLE "_posts_v_locales" DROP COLUMN "version_abstract";
  DROP TYPE "public"."enum_pages_blocks_calendar_embed_default_view";
  DROP TYPE "public"."enum_pages_blocks_content_with_banner_items_link_type";
  DROP TYPE "public"."enum_pages_blocks_content_with_banner_width_ratio";
  DROP TYPE "public"."enum__pages_v_blocks_calendar_embed_default_view";
  DROP TYPE "public"."enum__pages_v_blocks_content_with_banner_items_link_type";
  DROP TYPE "public"."enum__pages_v_blocks_content_with_banner_width_ratio";`)
}
