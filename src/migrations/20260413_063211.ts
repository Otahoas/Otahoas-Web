import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  CREATE TABLE IF NOT EXISTS "pages_blocks_committee_members_locales" (
  	"title" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );

  CREATE TABLE IF NOT EXISTS "_pages_v_blocks_committee_members_locales" (
  	"title" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );

  DROP INDEX IF EXISTS "pages_slug_idx";
  DROP INDEX IF EXISTS "_pages_v_version_version_slug_idx";
  DROP INDEX IF EXISTS "posts_slug_idx";
  DROP INDEX IF EXISTS "_posts_v_version_version_slug_idx";
  ALTER TABLE "pages_locales" ADD COLUMN IF NOT EXISTS "generate_slug" boolean DEFAULT true;
  ALTER TABLE "pages_locales" ADD COLUMN IF NOT EXISTS "slug" varchar;
  ALTER TABLE "_pages_v_locales" ADD COLUMN IF NOT EXISTS "version_generate_slug" boolean DEFAULT true;
  ALTER TABLE "_pages_v_locales" ADD COLUMN IF NOT EXISTS "version_slug" varchar;
  ALTER TABLE "posts_locales" ADD COLUMN IF NOT EXISTS "generate_slug" boolean DEFAULT true;
  ALTER TABLE "posts_locales" ADD COLUMN IF NOT EXISTS "slug" varchar;
  ALTER TABLE "_posts_v_locales" ADD COLUMN IF NOT EXISTS "version_generate_slug" boolean DEFAULT true;
  ALTER TABLE "_posts_v_locales" ADD COLUMN IF NOT EXISTS "version_slug" varchar;
  DO $$ BEGIN
    ALTER TABLE "pages_blocks_committee_members_locales" ADD CONSTRAINT "pages_blocks_committee_members_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_committee_members"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN
    ALTER TABLE "_pages_v_blocks_committee_members_locales" ADD CONSTRAINT "_pages_v_blocks_committee_members_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_committee_members"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  CREATE UNIQUE INDEX IF NOT EXISTS "pages_blocks_committee_members_locales_locale_parent_id_uniq" ON "pages_blocks_committee_members_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX IF NOT EXISTS "_pages_v_blocks_committee_members_locales_locale_parent_id_u" ON "_pages_v_blocks_committee_members_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX IF NOT EXISTS "pages_slug_idx" ON "pages_locales" USING btree ("slug","_locale");
  CREATE INDEX IF NOT EXISTS "_pages_v_version_version_slug_idx" ON "_pages_v_locales" USING btree ("version_slug","_locale");
  CREATE UNIQUE INDEX IF NOT EXISTS "posts_slug_idx" ON "posts_locales" USING btree ("slug","_locale");
  CREATE INDEX IF NOT EXISTS "_posts_v_version_version_slug_idx" ON "_posts_v_locales" USING btree ("version_slug","_locale");
  ALTER TABLE "pages_blocks_committee_members" DROP COLUMN IF EXISTS "title";
  ALTER TABLE "pages" DROP COLUMN IF EXISTS "generate_slug";
  ALTER TABLE "pages" DROP COLUMN IF EXISTS "slug";
  ALTER TABLE "_pages_v_blocks_committee_members" DROP COLUMN IF EXISTS "title";
  ALTER TABLE "_pages_v" DROP COLUMN IF EXISTS "version_generate_slug";
  ALTER TABLE "_pages_v" DROP COLUMN IF EXISTS "version_slug";
  ALTER TABLE "posts" DROP COLUMN IF EXISTS "generate_slug";
  ALTER TABLE "posts" DROP COLUMN IF EXISTS "slug";
  ALTER TABLE "_posts_v" DROP COLUMN IF EXISTS "version_generate_slug";
  ALTER TABLE "_posts_v" DROP COLUMN IF EXISTS "version_slug";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_committee_members_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_committee_members_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_blocks_committee_members_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_committee_members_locales" CASCADE;
  DROP INDEX "pages_slug_idx";
  DROP INDEX "_pages_v_version_version_slug_idx";
  DROP INDEX "posts_slug_idx";
  DROP INDEX "_posts_v_version_version_slug_idx";
  ALTER TABLE "pages_blocks_committee_members" ADD COLUMN "title" varchar;
  ALTER TABLE "pages" ADD COLUMN "generate_slug" boolean DEFAULT true;
  ALTER TABLE "pages" ADD COLUMN "slug" varchar;
  ALTER TABLE "_pages_v_blocks_committee_members" ADD COLUMN "title" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_generate_slug" boolean DEFAULT true;
  ALTER TABLE "_pages_v" ADD COLUMN "version_slug" varchar;
  ALTER TABLE "posts" ADD COLUMN "generate_slug" boolean DEFAULT true;
  ALTER TABLE "posts" ADD COLUMN "slug" varchar;
  ALTER TABLE "_posts_v" ADD COLUMN "version_generate_slug" boolean DEFAULT true;
  ALTER TABLE "_posts_v" ADD COLUMN "version_slug" varchar;
  CREATE UNIQUE INDEX "pages_slug_idx" ON "pages" USING btree ("slug");
  CREATE INDEX "_pages_v_version_version_slug_idx" ON "_pages_v" USING btree ("version_slug");
  CREATE UNIQUE INDEX "posts_slug_idx" ON "posts" USING btree ("slug");
  CREATE INDEX "_posts_v_version_version_slug_idx" ON "_posts_v" USING btree ("version_slug");
  ALTER TABLE "pages_locales" DROP COLUMN "generate_slug";
  ALTER TABLE "pages_locales" DROP COLUMN "slug";
  ALTER TABLE "_pages_v_locales" DROP COLUMN "version_generate_slug";
  ALTER TABLE "_pages_v_locales" DROP COLUMN "version_slug";
  ALTER TABLE "posts_locales" DROP COLUMN "generate_slug";
  ALTER TABLE "posts_locales" DROP COLUMN "slug";
  ALTER TABLE "_posts_v_locales" DROP COLUMN "version_generate_slug";
  ALTER TABLE "_posts_v_locales" DROP COLUMN "version_slug";`)
}
