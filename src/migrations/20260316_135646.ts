import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_image_scroller_display_mode" AS ENUM('grid', 'carousel');
  CREATE TYPE "public"."enum__pages_v_blocks_image_scroller_display_mode" AS ENUM('grid', 'carousel');
  CREATE TABLE "pages_blocks_cta_links_locales" (
  	"link_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_content_columns_locales" (
  	"rich_text" jsonb,
  	"link_type" "enum_pages_blocks_content_columns_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum_pages_blocks_content_columns_link_appearance" DEFAULT 'default',
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_calendar_embed_locales" (
  	"language" "enum_pages_blocks_calendar_embed_language" DEFAULT 'fi',
  	"title" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_access_request_form_locales" (
  	"language" "enum_pages_blocks_access_request_form_language" DEFAULT 'fi',
  	"intro_content" jsonb,
  	"confirmation_message" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_committee_locales" (
  	"title" varchar DEFAULT 'Toimikunta',
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_contact_info_locales" (
  	"title" varchar DEFAULT 'Yhteystiedot',
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_tilat_spaces" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"address" varchar,
  	"linked_page_id" integer
  );
  
  CREATE TABLE "pages_blocks_tilat_spaces_locales" (
  	"name" varchar,
  	"capacity" varchar,
  	"additional_info" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_tilat" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_tilat_locales" (
  	"title" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_image_scroller_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer
  );
  
  CREATE TABLE "pages_blocks_image_scroller_images_locales" (
  	"caption" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_image_scroller" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"display_mode" "enum_pages_blocks_image_scroller_display_mode" DEFAULT 'grid',
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_cta_links_locales" (
  	"link_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_content_columns_locales" (
  	"rich_text" jsonb,
  	"link_type" "enum__pages_v_blocks_content_columns_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum__pages_v_blocks_content_columns_link_appearance" DEFAULT 'default',
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_calendar_embed_locales" (
  	"language" "enum__pages_v_blocks_calendar_embed_language" DEFAULT 'fi',
  	"title" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_access_request_form_locales" (
  	"language" "enum__pages_v_blocks_access_request_form_language" DEFAULT 'fi',
  	"intro_content" jsonb,
  	"confirmation_message" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_committee_locales" (
  	"title" varchar DEFAULT 'Toimikunta',
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_contact_info_locales" (
  	"title" varchar DEFAULT 'Yhteystiedot',
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_tilat_spaces" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"address" varchar,
  	"linked_page_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_tilat_spaces_locales" (
  	"name" varchar,
  	"capacity" varchar,
  	"additional_info" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_tilat" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_tilat_locales" (
  	"title" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_image_scroller_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_image_scroller_images_locales" (
  	"caption" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_image_scroller" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"display_mode" "enum__pages_v_blocks_image_scroller_display_mode" DEFAULT 'grid',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "header_nav_items_locales" (
  	"link_label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "footer_nav_items_locales" (
  	"link_label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  DROP INDEX "pages_blocks_cta_links_locale_idx";
  DROP INDEX "pages_blocks_cta_locale_idx";
  DROP INDEX "pages_blocks_content_columns_locale_idx";
  DROP INDEX "pages_blocks_content_locale_idx";
  DROP INDEX "pages_blocks_media_block_locale_idx";
  DROP INDEX "pages_blocks_archive_locale_idx";
  DROP INDEX "pages_blocks_form_block_locale_idx";
  DROP INDEX "pages_blocks_calendar_embed_locale_idx";
  DROP INDEX "pages_blocks_access_request_form_locale_idx";
  DROP INDEX "pages_blocks_committee_members_locale_idx";
  DROP INDEX "pages_blocks_committee_locale_idx";
  DROP INDEX "pages_blocks_contact_info_telegram_channels_locale_idx";
  DROP INDEX "pages_blocks_contact_info_locale_idx";
  DROP INDEX "_pages_v_blocks_cta_links_locale_idx";
  DROP INDEX "_pages_v_blocks_cta_locale_idx";
  DROP INDEX "_pages_v_blocks_content_columns_locale_idx";
  DROP INDEX "_pages_v_blocks_content_locale_idx";
  DROP INDEX "_pages_v_blocks_media_block_locale_idx";
  DROP INDEX "_pages_v_blocks_archive_locale_idx";
  DROP INDEX "_pages_v_blocks_form_block_locale_idx";
  DROP INDEX "_pages_v_blocks_calendar_embed_locale_idx";
  DROP INDEX "_pages_v_blocks_access_request_form_locale_idx";
  DROP INDEX "_pages_v_blocks_committee_members_locale_idx";
  DROP INDEX "_pages_v_blocks_committee_locale_idx";
  DROP INDEX "_pages_v_blocks_contact_info_telegram_channels_locale_idx";
  DROP INDEX "_pages_v_blocks_contact_info_locale_idx";
  DROP INDEX "header_nav_items_locale_idx";
  DROP INDEX "header_rels_locale_idx";
  DROP INDEX "footer_nav_items_locale_idx";
  DROP INDEX "footer_rels_locale_idx";
  DROP INDEX "header_rels_pages_id_idx";
  DROP INDEX "header_rels_posts_id_idx";
  DROP INDEX "footer_rels_pages_id_idx";
  DROP INDEX "footer_rels_posts_id_idx";
  ALTER TABLE "pages_blocks_cta_links_locales" ADD CONSTRAINT "pages_blocks_cta_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_cta_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_content_columns_locales" ADD CONSTRAINT "pages_blocks_content_columns_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_content_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_calendar_embed_locales" ADD CONSTRAINT "pages_blocks_calendar_embed_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_calendar_embed"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_access_request_form_locales" ADD CONSTRAINT "pages_blocks_access_request_form_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_access_request_form"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_committee_locales" ADD CONSTRAINT "pages_blocks_committee_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_committee"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_contact_info_locales" ADD CONSTRAINT "pages_blocks_contact_info_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_contact_info"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_tilat_spaces" ADD CONSTRAINT "pages_blocks_tilat_spaces_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_tilat_spaces" ADD CONSTRAINT "pages_blocks_tilat_spaces_linked_page_id_pages_id_fk" FOREIGN KEY ("linked_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_tilat_spaces" ADD CONSTRAINT "pages_blocks_tilat_spaces_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_tilat"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_tilat_spaces_locales" ADD CONSTRAINT "pages_blocks_tilat_spaces_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_tilat_spaces"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_tilat" ADD CONSTRAINT "pages_blocks_tilat_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_tilat_locales" ADD CONSTRAINT "pages_blocks_tilat_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_tilat"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_image_scroller_images" ADD CONSTRAINT "pages_blocks_image_scroller_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_image_scroller_images" ADD CONSTRAINT "pages_blocks_image_scroller_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_image_scroller"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_image_scroller_images_locales" ADD CONSTRAINT "pages_blocks_image_scroller_images_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_image_scroller_images"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_image_scroller" ADD CONSTRAINT "pages_blocks_image_scroller_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_cta_links_locales" ADD CONSTRAINT "_pages_v_blocks_cta_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_cta_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_content_columns_locales" ADD CONSTRAINT "_pages_v_blocks_content_columns_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_content_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_calendar_embed_locales" ADD CONSTRAINT "_pages_v_blocks_calendar_embed_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_calendar_embed"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_access_request_form_locales" ADD CONSTRAINT "_pages_v_blocks_access_request_form_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_access_request_form"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_committee_locales" ADD CONSTRAINT "_pages_v_blocks_committee_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_committee"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_contact_info_locales" ADD CONSTRAINT "_pages_v_blocks_contact_info_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_contact_info"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_tilat_spaces" ADD CONSTRAINT "_pages_v_blocks_tilat_spaces_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_tilat_spaces" ADD CONSTRAINT "_pages_v_blocks_tilat_spaces_linked_page_id_pages_id_fk" FOREIGN KEY ("linked_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_tilat_spaces" ADD CONSTRAINT "_pages_v_blocks_tilat_spaces_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_tilat"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_tilat_spaces_locales" ADD CONSTRAINT "_pages_v_blocks_tilat_spaces_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_tilat_spaces"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_tilat" ADD CONSTRAINT "_pages_v_blocks_tilat_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_tilat_locales" ADD CONSTRAINT "_pages_v_blocks_tilat_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_tilat"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_image_scroller_images" ADD CONSTRAINT "_pages_v_blocks_image_scroller_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_image_scroller_images" ADD CONSTRAINT "_pages_v_blocks_image_scroller_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_image_scroller"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_image_scroller_images_locales" ADD CONSTRAINT "_pages_v_blocks_image_scroller_images_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_image_scroller_images"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_image_scroller" ADD CONSTRAINT "_pages_v_blocks_image_scroller_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_nav_items_locales" ADD CONSTRAINT "header_nav_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."header_nav_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_nav_items_locales" ADD CONSTRAINT "footer_nav_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer_nav_items"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "pages_blocks_cta_links_locales_locale_parent_id_unique" ON "pages_blocks_cta_links_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "pages_blocks_content_columns_locales_locale_parent_id_unique" ON "pages_blocks_content_columns_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "pages_blocks_calendar_embed_locales_locale_parent_id_unique" ON "pages_blocks_calendar_embed_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "pages_blocks_access_request_form_locales_locale_parent_id_un" ON "pages_blocks_access_request_form_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "pages_blocks_committee_locales_locale_parent_id_unique" ON "pages_blocks_committee_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "pages_blocks_contact_info_locales_locale_parent_id_unique" ON "pages_blocks_contact_info_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_tilat_spaces_order_idx" ON "pages_blocks_tilat_spaces" USING btree ("_order");
  CREATE INDEX "pages_blocks_tilat_spaces_parent_id_idx" ON "pages_blocks_tilat_spaces" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_tilat_spaces_image_idx" ON "pages_blocks_tilat_spaces" USING btree ("image_id");
  CREATE INDEX "pages_blocks_tilat_spaces_linked_page_idx" ON "pages_blocks_tilat_spaces" USING btree ("linked_page_id");
  CREATE UNIQUE INDEX "pages_blocks_tilat_spaces_locales_locale_parent_id_unique" ON "pages_blocks_tilat_spaces_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_tilat_order_idx" ON "pages_blocks_tilat" USING btree ("_order");
  CREATE INDEX "pages_blocks_tilat_parent_id_idx" ON "pages_blocks_tilat" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_tilat_path_idx" ON "pages_blocks_tilat" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_blocks_tilat_locales_locale_parent_id_unique" ON "pages_blocks_tilat_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_image_scroller_images_order_idx" ON "pages_blocks_image_scroller_images" USING btree ("_order");
  CREATE INDEX "pages_blocks_image_scroller_images_parent_id_idx" ON "pages_blocks_image_scroller_images" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_image_scroller_images_image_idx" ON "pages_blocks_image_scroller_images" USING btree ("image_id");
  CREATE UNIQUE INDEX "pages_blocks_image_scroller_images_locales_locale_parent_id_" ON "pages_blocks_image_scroller_images_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_image_scroller_order_idx" ON "pages_blocks_image_scroller" USING btree ("_order");
  CREATE INDEX "pages_blocks_image_scroller_parent_id_idx" ON "pages_blocks_image_scroller" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_image_scroller_path_idx" ON "pages_blocks_image_scroller" USING btree ("_path");
  CREATE UNIQUE INDEX "_pages_v_blocks_cta_links_locales_locale_parent_id_unique" ON "_pages_v_blocks_cta_links_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_content_columns_locales_locale_parent_id_uni" ON "_pages_v_blocks_content_columns_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_calendar_embed_locales_locale_parent_id_uniq" ON "_pages_v_blocks_calendar_embed_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_access_request_form_locales_locale_parent_id" ON "_pages_v_blocks_access_request_form_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_committee_locales_locale_parent_id_unique" ON "_pages_v_blocks_committee_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_contact_info_locales_locale_parent_id_unique" ON "_pages_v_blocks_contact_info_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_tilat_spaces_order_idx" ON "_pages_v_blocks_tilat_spaces" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_tilat_spaces_parent_id_idx" ON "_pages_v_blocks_tilat_spaces" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_tilat_spaces_image_idx" ON "_pages_v_blocks_tilat_spaces" USING btree ("image_id");
  CREATE INDEX "_pages_v_blocks_tilat_spaces_linked_page_idx" ON "_pages_v_blocks_tilat_spaces" USING btree ("linked_page_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_tilat_spaces_locales_locale_parent_id_unique" ON "_pages_v_blocks_tilat_spaces_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_tilat_order_idx" ON "_pages_v_blocks_tilat" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_tilat_parent_id_idx" ON "_pages_v_blocks_tilat" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_tilat_path_idx" ON "_pages_v_blocks_tilat" USING btree ("_path");
  CREATE UNIQUE INDEX "_pages_v_blocks_tilat_locales_locale_parent_id_unique" ON "_pages_v_blocks_tilat_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_image_scroller_images_order_idx" ON "_pages_v_blocks_image_scroller_images" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_image_scroller_images_parent_id_idx" ON "_pages_v_blocks_image_scroller_images" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_image_scroller_images_image_idx" ON "_pages_v_blocks_image_scroller_images" USING btree ("image_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_image_scroller_images_locales_locale_parent_" ON "_pages_v_blocks_image_scroller_images_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_image_scroller_order_idx" ON "_pages_v_blocks_image_scroller" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_image_scroller_parent_id_idx" ON "_pages_v_blocks_image_scroller" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_image_scroller_path_idx" ON "_pages_v_blocks_image_scroller" USING btree ("_path");
  CREATE UNIQUE INDEX "header_nav_items_locales_locale_parent_id_unique" ON "header_nav_items_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "footer_nav_items_locales_locale_parent_id_unique" ON "footer_nav_items_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "header_rels_pages_id_idx" ON "header_rels" USING btree ("pages_id");
  CREATE INDEX "header_rels_posts_id_idx" ON "header_rels" USING btree ("posts_id");
  CREATE INDEX "footer_rels_pages_id_idx" ON "footer_rels" USING btree ("pages_id");
  CREATE INDEX "footer_rels_posts_id_idx" ON "footer_rels" USING btree ("posts_id");
  INSERT INTO "pages_blocks_content_columns_locales" ("rich_text", "link_type", "link_new_tab", "link_url", "link_label", "link_appearance", "_locale", "_parent_id")
  SELECT "rich_text", "link_type", "link_new_tab", "link_url", "link_label", "link_appearance", "_locale", "id"
  FROM "pages_blocks_content_columns" WHERE "_locale" IS NOT NULL;
  INSERT INTO "pages_blocks_calendar_embed_locales" ("language", "title", "_locale", "_parent_id")
  SELECT "language", "title", "_locale", "id"
  FROM "pages_blocks_calendar_embed" WHERE "_locale" IS NOT NULL;
  INSERT INTO "pages_blocks_committee_locales" ("title", "description", "_locale", "_parent_id")
  SELECT "title", "description", "_locale", "id"
  FROM "pages_blocks_committee" WHERE "_locale" IS NOT NULL;
  INSERT INTO "pages_blocks_contact_info_locales" ("title", "_locale", "_parent_id")
  SELECT "title", "_locale", "id"
  FROM "pages_blocks_contact_info" WHERE "_locale" IS NOT NULL;
  INSERT INTO "header_nav_items_locales" ("link_label", "_locale", "_parent_id")
  SELECT "link_label", "_locale", "id"
  FROM "header_nav_items" WHERE "_locale" IS NOT NULL;
  INSERT INTO "footer_nav_items_locales" ("link_label", "_locale", "_parent_id")
  SELECT "link_label", "_locale", "id"
  FROM "footer_nav_items" WHERE "_locale" IS NOT NULL;
  ALTER TABLE "pages_blocks_cta_links" DROP COLUMN "_locale";
  ALTER TABLE "pages_blocks_cta_links" DROP COLUMN "link_label";
  ALTER TABLE "pages_blocks_cta" DROP COLUMN "_locale";
  ALTER TABLE "pages_blocks_content_columns" DROP COLUMN "_locale";
  ALTER TABLE "pages_blocks_content_columns" DROP COLUMN "rich_text";
  ALTER TABLE "pages_blocks_content_columns" DROP COLUMN "link_type";
  ALTER TABLE "pages_blocks_content_columns" DROP COLUMN "link_new_tab";
  ALTER TABLE "pages_blocks_content_columns" DROP COLUMN "link_url";
  ALTER TABLE "pages_blocks_content_columns" DROP COLUMN "link_label";
  ALTER TABLE "pages_blocks_content_columns" DROP COLUMN "link_appearance";
  ALTER TABLE "pages_blocks_content" DROP COLUMN "_locale";
  ALTER TABLE "pages_blocks_media_block" DROP COLUMN "_locale";
  ALTER TABLE "pages_blocks_archive" DROP COLUMN "_locale";
  ALTER TABLE "pages_blocks_form_block" DROP COLUMN "_locale";
  ALTER TABLE "pages_blocks_calendar_embed" DROP COLUMN "_locale";
  ALTER TABLE "pages_blocks_calendar_embed" DROP COLUMN "language";
  ALTER TABLE "pages_blocks_calendar_embed" DROP COLUMN "title";
  ALTER TABLE "pages_blocks_access_request_form" DROP COLUMN "_locale";
  ALTER TABLE "pages_blocks_access_request_form" DROP COLUMN "language";
  ALTER TABLE "pages_blocks_access_request_form" DROP COLUMN "intro_content";
  ALTER TABLE "pages_blocks_access_request_form" DROP COLUMN "confirmation_message";
  ALTER TABLE "pages_blocks_committee_members" DROP COLUMN "_locale";
  ALTER TABLE "pages_blocks_committee" DROP COLUMN "_locale";
  ALTER TABLE "pages_blocks_committee" DROP COLUMN "title";
  ALTER TABLE "pages_blocks_committee" DROP COLUMN "description";
  ALTER TABLE "pages_blocks_contact_info_telegram_channels" DROP COLUMN "_locale";
  ALTER TABLE "pages_blocks_contact_info" DROP COLUMN "_locale";
  ALTER TABLE "pages_blocks_contact_info" DROP COLUMN "title";
  ALTER TABLE "_pages_v_blocks_cta_links" DROP COLUMN "_locale";
  ALTER TABLE "_pages_v_blocks_cta_links" DROP COLUMN "link_label";
  ALTER TABLE "_pages_v_blocks_cta" DROP COLUMN "_locale";
  ALTER TABLE "_pages_v_blocks_content_columns" DROP COLUMN "_locale";
  ALTER TABLE "_pages_v_blocks_content_columns" DROP COLUMN "rich_text";
  ALTER TABLE "_pages_v_blocks_content_columns" DROP COLUMN "link_type";
  ALTER TABLE "_pages_v_blocks_content_columns" DROP COLUMN "link_new_tab";
  ALTER TABLE "_pages_v_blocks_content_columns" DROP COLUMN "link_url";
  ALTER TABLE "_pages_v_blocks_content_columns" DROP COLUMN "link_label";
  ALTER TABLE "_pages_v_blocks_content_columns" DROP COLUMN "link_appearance";
  ALTER TABLE "_pages_v_blocks_content" DROP COLUMN "_locale";
  ALTER TABLE "_pages_v_blocks_media_block" DROP COLUMN "_locale";
  ALTER TABLE "_pages_v_blocks_archive" DROP COLUMN "_locale";
  ALTER TABLE "_pages_v_blocks_form_block" DROP COLUMN "_locale";
  ALTER TABLE "_pages_v_blocks_calendar_embed" DROP COLUMN "_locale";
  ALTER TABLE "_pages_v_blocks_calendar_embed" DROP COLUMN "language";
  ALTER TABLE "_pages_v_blocks_calendar_embed" DROP COLUMN "title";
  ALTER TABLE "_pages_v_blocks_access_request_form" DROP COLUMN "_locale";
  ALTER TABLE "_pages_v_blocks_access_request_form" DROP COLUMN "language";
  ALTER TABLE "_pages_v_blocks_access_request_form" DROP COLUMN "intro_content";
  ALTER TABLE "_pages_v_blocks_access_request_form" DROP COLUMN "confirmation_message";
  ALTER TABLE "_pages_v_blocks_committee_members" DROP COLUMN "_locale";
  ALTER TABLE "_pages_v_blocks_committee" DROP COLUMN "_locale";
  ALTER TABLE "_pages_v_blocks_committee" DROP COLUMN "title";
  ALTER TABLE "_pages_v_blocks_committee" DROP COLUMN "description";
  ALTER TABLE "_pages_v_blocks_contact_info_telegram_channels" DROP COLUMN "_locale";
  ALTER TABLE "_pages_v_blocks_contact_info" DROP COLUMN "_locale";
  ALTER TABLE "_pages_v_blocks_contact_info" DROP COLUMN "title";
  ALTER TABLE "header_nav_items" DROP COLUMN "_locale";
  ALTER TABLE "header_nav_items" DROP COLUMN "link_label";
  ALTER TABLE "header_rels" DROP COLUMN "locale";
  ALTER TABLE "footer_nav_items" DROP COLUMN "_locale";
  ALTER TABLE "footer_nav_items" DROP COLUMN "link_label";
  ALTER TABLE "footer_rels" DROP COLUMN "locale";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_cta_links_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_content_columns_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_calendar_embed_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_access_request_form_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_committee_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_contact_info_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_tilat_spaces" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_tilat_spaces_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_tilat" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_tilat_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_image_scroller_images" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_image_scroller_images_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_image_scroller" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_cta_links_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_content_columns_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_calendar_embed_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_access_request_form_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_committee_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_contact_info_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_tilat_spaces" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_tilat_spaces_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_tilat" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_tilat_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_image_scroller_images" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_image_scroller_images_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_image_scroller" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "header_nav_items_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "footer_nav_items_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_blocks_cta_links_locales" CASCADE;
  DROP TABLE "pages_blocks_content_columns_locales" CASCADE;
  DROP TABLE "pages_blocks_calendar_embed_locales" CASCADE;
  DROP TABLE "pages_blocks_access_request_form_locales" CASCADE;
  DROP TABLE "pages_blocks_committee_locales" CASCADE;
  DROP TABLE "pages_blocks_contact_info_locales" CASCADE;
  DROP TABLE "pages_blocks_tilat_spaces" CASCADE;
  DROP TABLE "pages_blocks_tilat_spaces_locales" CASCADE;
  DROP TABLE "pages_blocks_tilat" CASCADE;
  DROP TABLE "pages_blocks_tilat_locales" CASCADE;
  DROP TABLE "pages_blocks_image_scroller_images" CASCADE;
  DROP TABLE "pages_blocks_image_scroller_images_locales" CASCADE;
  DROP TABLE "pages_blocks_image_scroller" CASCADE;
  DROP TABLE "_pages_v_blocks_cta_links_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_content_columns_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_calendar_embed_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_access_request_form_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_committee_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_contact_info_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_tilat_spaces" CASCADE;
  DROP TABLE "_pages_v_blocks_tilat_spaces_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_tilat" CASCADE;
  DROP TABLE "_pages_v_blocks_tilat_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_image_scroller_images" CASCADE;
  DROP TABLE "_pages_v_blocks_image_scroller_images_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_image_scroller" CASCADE;
  DROP TABLE "header_nav_items_locales" CASCADE;
  DROP TABLE "footer_nav_items_locales" CASCADE;
  DROP INDEX "header_rels_pages_id_idx";
  DROP INDEX "header_rels_posts_id_idx";
  DROP INDEX "footer_rels_pages_id_idx";
  DROP INDEX "footer_rels_posts_id_idx";
  ALTER TABLE "pages_blocks_cta_links" ADD COLUMN "_locale" "_locales" NOT NULL;
  ALTER TABLE "pages_blocks_cta_links" ADD COLUMN "link_label" varchar;
  ALTER TABLE "pages_blocks_cta" ADD COLUMN "_locale" "_locales" NOT NULL;
  ALTER TABLE "pages_blocks_content_columns" ADD COLUMN "_locale" "_locales" NOT NULL;
  ALTER TABLE "pages_blocks_content_columns" ADD COLUMN "rich_text" jsonb;
  ALTER TABLE "pages_blocks_content_columns" ADD COLUMN "link_type" "enum_pages_blocks_content_columns_link_type" DEFAULT 'reference';
  ALTER TABLE "pages_blocks_content_columns" ADD COLUMN "link_new_tab" boolean;
  ALTER TABLE "pages_blocks_content_columns" ADD COLUMN "link_url" varchar;
  ALTER TABLE "pages_blocks_content_columns" ADD COLUMN "link_label" varchar;
  ALTER TABLE "pages_blocks_content_columns" ADD COLUMN "link_appearance" "enum_pages_blocks_content_columns_link_appearance" DEFAULT 'default';
  ALTER TABLE "pages_blocks_content" ADD COLUMN "_locale" "_locales" NOT NULL;
  ALTER TABLE "pages_blocks_media_block" ADD COLUMN "_locale" "_locales" NOT NULL;
  ALTER TABLE "pages_blocks_archive" ADD COLUMN "_locale" "_locales" NOT NULL;
  ALTER TABLE "pages_blocks_form_block" ADD COLUMN "_locale" "_locales" NOT NULL;
  ALTER TABLE "pages_blocks_calendar_embed" ADD COLUMN "_locale" "_locales" NOT NULL;
  ALTER TABLE "pages_blocks_calendar_embed" ADD COLUMN "language" "enum_pages_blocks_calendar_embed_language" DEFAULT 'fi';
  ALTER TABLE "pages_blocks_calendar_embed" ADD COLUMN "title" varchar;
  ALTER TABLE "pages_blocks_access_request_form" ADD COLUMN "_locale" "_locales" NOT NULL;
  ALTER TABLE "pages_blocks_access_request_form" ADD COLUMN "language" "enum_pages_blocks_access_request_form_language" DEFAULT 'fi';
  ALTER TABLE "pages_blocks_access_request_form" ADD COLUMN "intro_content" jsonb;
  ALTER TABLE "pages_blocks_access_request_form" ADD COLUMN "confirmation_message" jsonb;
  ALTER TABLE "pages_blocks_committee_members" ADD COLUMN "_locale" "_locales" NOT NULL;
  ALTER TABLE "pages_blocks_committee" ADD COLUMN "_locale" "_locales" NOT NULL;
  ALTER TABLE "pages_blocks_committee" ADD COLUMN "title" varchar DEFAULT 'Toimikunta';
  ALTER TABLE "pages_blocks_committee" ADD COLUMN "description" varchar;
  ALTER TABLE "pages_blocks_contact_info_telegram_channels" ADD COLUMN "_locale" "_locales" NOT NULL;
  ALTER TABLE "pages_blocks_contact_info" ADD COLUMN "_locale" "_locales" NOT NULL;
  ALTER TABLE "pages_blocks_contact_info" ADD COLUMN "title" varchar DEFAULT 'Yhteystiedot';
  ALTER TABLE "_pages_v_blocks_cta_links" ADD COLUMN "_locale" "_locales" NOT NULL;
  ALTER TABLE "_pages_v_blocks_cta_links" ADD COLUMN "link_label" varchar;
  ALTER TABLE "_pages_v_blocks_cta" ADD COLUMN "_locale" "_locales" NOT NULL;
  ALTER TABLE "_pages_v_blocks_content_columns" ADD COLUMN "_locale" "_locales" NOT NULL;
  ALTER TABLE "_pages_v_blocks_content_columns" ADD COLUMN "rich_text" jsonb;
  ALTER TABLE "_pages_v_blocks_content_columns" ADD COLUMN "link_type" "enum__pages_v_blocks_content_columns_link_type" DEFAULT 'reference';
  ALTER TABLE "_pages_v_blocks_content_columns" ADD COLUMN "link_new_tab" boolean;
  ALTER TABLE "_pages_v_blocks_content_columns" ADD COLUMN "link_url" varchar;
  ALTER TABLE "_pages_v_blocks_content_columns" ADD COLUMN "link_label" varchar;
  ALTER TABLE "_pages_v_blocks_content_columns" ADD COLUMN "link_appearance" "enum__pages_v_blocks_content_columns_link_appearance" DEFAULT 'default';
  ALTER TABLE "_pages_v_blocks_content" ADD COLUMN "_locale" "_locales" NOT NULL;
  ALTER TABLE "_pages_v_blocks_media_block" ADD COLUMN "_locale" "_locales" NOT NULL;
  ALTER TABLE "_pages_v_blocks_archive" ADD COLUMN "_locale" "_locales" NOT NULL;
  ALTER TABLE "_pages_v_blocks_form_block" ADD COLUMN "_locale" "_locales" NOT NULL;
  ALTER TABLE "_pages_v_blocks_calendar_embed" ADD COLUMN "_locale" "_locales" NOT NULL;
  ALTER TABLE "_pages_v_blocks_calendar_embed" ADD COLUMN "language" "enum__pages_v_blocks_calendar_embed_language" DEFAULT 'fi';
  ALTER TABLE "_pages_v_blocks_calendar_embed" ADD COLUMN "title" varchar;
  ALTER TABLE "_pages_v_blocks_access_request_form" ADD COLUMN "_locale" "_locales" NOT NULL;
  ALTER TABLE "_pages_v_blocks_access_request_form" ADD COLUMN "language" "enum__pages_v_blocks_access_request_form_language" DEFAULT 'fi';
  ALTER TABLE "_pages_v_blocks_access_request_form" ADD COLUMN "intro_content" jsonb;
  ALTER TABLE "_pages_v_blocks_access_request_form" ADD COLUMN "confirmation_message" jsonb;
  ALTER TABLE "_pages_v_blocks_committee_members" ADD COLUMN "_locale" "_locales" NOT NULL;
  ALTER TABLE "_pages_v_blocks_committee" ADD COLUMN "_locale" "_locales" NOT NULL;
  ALTER TABLE "_pages_v_blocks_committee" ADD COLUMN "title" varchar DEFAULT 'Toimikunta';
  ALTER TABLE "_pages_v_blocks_committee" ADD COLUMN "description" varchar;
  ALTER TABLE "_pages_v_blocks_contact_info_telegram_channels" ADD COLUMN "_locale" "_locales" NOT NULL;
  ALTER TABLE "_pages_v_blocks_contact_info" ADD COLUMN "_locale" "_locales" NOT NULL;
  ALTER TABLE "_pages_v_blocks_contact_info" ADD COLUMN "title" varchar DEFAULT 'Yhteystiedot';
  ALTER TABLE "header_nav_items" ADD COLUMN "_locale" "_locales" NOT NULL;
  ALTER TABLE "header_nav_items" ADD COLUMN "link_label" varchar NOT NULL;
  ALTER TABLE "header_rels" ADD COLUMN "locale" "_locales";
  ALTER TABLE "footer_nav_items" ADD COLUMN "_locale" "_locales" NOT NULL;
  ALTER TABLE "footer_nav_items" ADD COLUMN "link_label" varchar NOT NULL;
  ALTER TABLE "footer_rels" ADD COLUMN "locale" "_locales";
  CREATE INDEX "pages_blocks_cta_links_locale_idx" ON "pages_blocks_cta_links" USING btree ("_locale");
  CREATE INDEX "pages_blocks_cta_locale_idx" ON "pages_blocks_cta" USING btree ("_locale");
  CREATE INDEX "pages_blocks_content_columns_locale_idx" ON "pages_blocks_content_columns" USING btree ("_locale");
  CREATE INDEX "pages_blocks_content_locale_idx" ON "pages_blocks_content" USING btree ("_locale");
  CREATE INDEX "pages_blocks_media_block_locale_idx" ON "pages_blocks_media_block" USING btree ("_locale");
  CREATE INDEX "pages_blocks_archive_locale_idx" ON "pages_blocks_archive" USING btree ("_locale");
  CREATE INDEX "pages_blocks_form_block_locale_idx" ON "pages_blocks_form_block" USING btree ("_locale");
  CREATE INDEX "pages_blocks_calendar_embed_locale_idx" ON "pages_blocks_calendar_embed" USING btree ("_locale");
  CREATE INDEX "pages_blocks_access_request_form_locale_idx" ON "pages_blocks_access_request_form" USING btree ("_locale");
  CREATE INDEX "pages_blocks_committee_members_locale_idx" ON "pages_blocks_committee_members" USING btree ("_locale");
  CREATE INDEX "pages_blocks_committee_locale_idx" ON "pages_blocks_committee" USING btree ("_locale");
  CREATE INDEX "pages_blocks_contact_info_telegram_channels_locale_idx" ON "pages_blocks_contact_info_telegram_channels" USING btree ("_locale");
  CREATE INDEX "pages_blocks_contact_info_locale_idx" ON "pages_blocks_contact_info" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_cta_links_locale_idx" ON "_pages_v_blocks_cta_links" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_cta_locale_idx" ON "_pages_v_blocks_cta" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_content_columns_locale_idx" ON "_pages_v_blocks_content_columns" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_content_locale_idx" ON "_pages_v_blocks_content" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_media_block_locale_idx" ON "_pages_v_blocks_media_block" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_archive_locale_idx" ON "_pages_v_blocks_archive" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_form_block_locale_idx" ON "_pages_v_blocks_form_block" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_calendar_embed_locale_idx" ON "_pages_v_blocks_calendar_embed" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_access_request_form_locale_idx" ON "_pages_v_blocks_access_request_form" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_committee_members_locale_idx" ON "_pages_v_blocks_committee_members" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_committee_locale_idx" ON "_pages_v_blocks_committee" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_contact_info_telegram_channels_locale_idx" ON "_pages_v_blocks_contact_info_telegram_channels" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_contact_info_locale_idx" ON "_pages_v_blocks_contact_info" USING btree ("_locale");
  CREATE INDEX "header_nav_items_locale_idx" ON "header_nav_items" USING btree ("_locale");
  CREATE INDEX "header_rels_locale_idx" ON "header_rels" USING btree ("locale");
  CREATE INDEX "footer_nav_items_locale_idx" ON "footer_nav_items" USING btree ("_locale");
  CREATE INDEX "footer_rels_locale_idx" ON "footer_rels" USING btree ("locale");
  CREATE INDEX "header_rels_pages_id_idx" ON "header_rels" USING btree ("pages_id","locale");
  CREATE INDEX "header_rels_posts_id_idx" ON "header_rels" USING btree ("posts_id","locale");
  CREATE INDEX "footer_rels_pages_id_idx" ON "footer_rels" USING btree ("pages_id","locale");
  CREATE INDEX "footer_rels_posts_id_idx" ON "footer_rels" USING btree ("posts_id","locale");
  ALTER TABLE "pages_blocks_calendar_embed" DROP COLUMN "public_events_calendar_id";
  ALTER TABLE "_pages_v_blocks_calendar_embed" DROP COLUMN "public_events_calendar_id";
  DROP TYPE "public"."enum_pages_blocks_image_scroller_display_mode";
  DROP TYPE "public"."enum__pages_v_blocks_image_scroller_display_mode";`)
}
