import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "posts" ADD COLUMN "hero_image_dark_id" integer;
  ALTER TABLE "_posts_v" ADD COLUMN "version_hero_image_dark_id" integer;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_hero_image_dark_id_media_id_fk" FOREIGN KEY ("hero_image_dark_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_hero_image_dark_id_media_id_fk" FOREIGN KEY ("version_hero_image_dark_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "posts_hero_image_dark_idx" ON "posts" USING btree ("hero_image_dark_id");
  CREATE INDEX "_posts_v_version_version_hero_image_dark_idx" ON "_posts_v" USING btree ("version_hero_image_dark_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "posts" DROP CONSTRAINT "posts_hero_image_dark_id_media_id_fk";
  
  ALTER TABLE "_posts_v" DROP CONSTRAINT "_posts_v_version_hero_image_dark_id_media_id_fk";
  
  DROP INDEX "posts_hero_image_dark_idx";
  DROP INDEX "_posts_v_version_version_hero_image_dark_idx";
  ALTER TABLE "posts" DROP COLUMN "hero_image_dark_id";
  ALTER TABLE "_posts_v" DROP COLUMN "version_hero_image_dark_id";`)
}
