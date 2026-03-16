import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "pages_blocks_contact_info_links_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_contact_info_links_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "pages_blocks_contact_info_links_locales" ADD CONSTRAINT "pages_blocks_contact_info_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_contact_info_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_contact_info_links_locales" ADD CONSTRAINT "_pages_v_blocks_contact_info_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_contact_info_links"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "pages_blocks_contact_info_links_locales_locale_parent_id_uni" ON "pages_blocks_contact_info_links_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_contact_info_links_locales_locale_parent_id_" ON "_pages_v_blocks_contact_info_links_locales" USING btree ("_locale","_parent_id");
  INSERT INTO "pages_blocks_contact_info_links_locales" ("_locale", "_parent_id", "label")
    SELECT 'fi', id, label FROM "pages_blocks_contact_info_links";
  INSERT INTO "pages_blocks_contact_info_links_locales" ("_locale", "_parent_id", "label")
    SELECT 'en', id, label FROM "pages_blocks_contact_info_links";
  INSERT INTO "_pages_v_blocks_contact_info_links_locales" ("_locale", "_parent_id", "label")
    SELECT 'fi', id, label FROM "_pages_v_blocks_contact_info_links";
  INSERT INTO "_pages_v_blocks_contact_info_links_locales" ("_locale", "_parent_id", "label")
    SELECT 'en', id, label FROM "_pages_v_blocks_contact_info_links";
  ALTER TABLE "pages_blocks_contact_info_links" DROP COLUMN "label";
  ALTER TABLE "_pages_v_blocks_contact_info_links" DROP COLUMN "label";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_contact_info_links_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_contact_info_links_locales" CASCADE;
  ALTER TABLE "pages_blocks_contact_info_links" ADD COLUMN "label" varchar;
  ALTER TABLE "_pages_v_blocks_contact_info_links" ADD COLUMN "label" varchar;`)
}
