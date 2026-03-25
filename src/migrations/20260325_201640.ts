import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "pages_slug_idx";
  DROP INDEX "_pages_v_version_version_slug_idx";
  DROP INDEX "posts_slug_idx";
  DROP INDEX "_posts_v_version_version_slug_idx";
  ALTER TABLE "pages_locales" ADD COLUMN "generate_slug" boolean DEFAULT true;
  ALTER TABLE "pages_locales" ADD COLUMN "slug" varchar;
  ALTER TABLE "_pages_v_locales" ADD COLUMN "version_generate_slug" boolean DEFAULT true;
  ALTER TABLE "_pages_v_locales" ADD COLUMN "version_slug" varchar;
  ALTER TABLE "posts_locales" ADD COLUMN "generate_slug" boolean DEFAULT true;
  ALTER TABLE "posts_locales" ADD COLUMN "slug" varchar;
  ALTER TABLE "_posts_v_locales" ADD COLUMN "version_generate_slug" boolean DEFAULT true;
  ALTER TABLE "_posts_v_locales" ADD COLUMN "version_slug" varchar;
  CREATE UNIQUE INDEX "pages_slug_idx" ON "pages_locales" USING btree ("slug","_locale");
  CREATE INDEX "_pages_v_version_version_slug_idx" ON "_pages_v_locales" USING btree ("version_slug","_locale");
  CREATE UNIQUE INDEX "posts_slug_idx" ON "posts_locales" USING btree ("slug","_locale");
  CREATE INDEX "_posts_v_version_version_slug_idx" ON "_posts_v_locales" USING btree ("version_slug","_locale");
  ALTER TABLE "pages" DROP COLUMN "generate_slug";
  ALTER TABLE "pages" DROP COLUMN "slug";
  ALTER TABLE "_pages_v" DROP COLUMN "version_generate_slug";
  ALTER TABLE "_pages_v" DROP COLUMN "version_slug";
  ALTER TABLE "posts" DROP COLUMN "generate_slug";
  ALTER TABLE "posts" DROP COLUMN "slug";
  ALTER TABLE "_posts_v" DROP COLUMN "version_generate_slug";
  ALTER TABLE "_posts_v" DROP COLUMN "version_slug";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "pages_slug_idx";
  DROP INDEX "_pages_v_version_version_slug_idx";
  DROP INDEX "posts_slug_idx";
  DROP INDEX "_posts_v_version_version_slug_idx";
  ALTER TABLE "pages" ADD COLUMN "generate_slug" boolean DEFAULT true;
  ALTER TABLE "pages" ADD COLUMN "slug" varchar;
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
