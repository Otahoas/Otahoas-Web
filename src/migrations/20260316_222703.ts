import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_contact_info_links_type" AS ENUM('email', 'telegram', 'website');
  CREATE TYPE "public"."enum__pages_v_blocks_contact_info_links_type" AS ENUM('email', 'telegram', 'website');
  ALTER TABLE "pages_blocks_contact_info_telegram_channels" RENAME TO "pages_blocks_contact_info_links";
  ALTER TABLE "_pages_v_blocks_contact_info_telegram_channels" RENAME TO "_pages_v_blocks_contact_info_links";
  ALTER TABLE "pages_blocks_contact_info_links" RENAME COLUMN "name" TO "label";
  ALTER TABLE "_pages_v_blocks_contact_info_links" RENAME COLUMN "name" TO "label";
  ALTER TABLE "pages_blocks_contact_info_links" DROP CONSTRAINT "pages_blocks_contact_info_telegram_channels_parent_id_fk";
  
  ALTER TABLE "_pages_v_blocks_contact_info_links" DROP CONSTRAINT "_pages_v_blocks_contact_info_telegram_channels_parent_id_fk";
  
  DROP INDEX "pages_blocks_contact_info_telegram_channels_order_idx";
  DROP INDEX "pages_blocks_contact_info_telegram_channels_parent_id_idx";
  DROP INDEX "_pages_v_blocks_contact_info_telegram_channels_order_idx";
  DROP INDEX "_pages_v_blocks_contact_info_telegram_channels_parent_id_idx";
  ALTER TABLE "pages_blocks_committee" ADD COLUMN IF NOT EXISTS "email" varchar;
  ALTER TABLE "pages_blocks_contact_info_links" ADD COLUMN "type" "enum_pages_blocks_contact_info_links_type" DEFAULT 'email';
  ALTER TABLE "_pages_v_blocks_committee" ADD COLUMN IF NOT EXISTS "email" varchar;
  ALTER TABLE "_pages_v_blocks_contact_info_links" ADD COLUMN "type" "enum__pages_v_blocks_contact_info_links_type" DEFAULT 'email';
  ALTER TABLE "pages_blocks_contact_info_links" ADD CONSTRAINT "pages_blocks_contact_info_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_contact_info"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_contact_info_links" ADD CONSTRAINT "_pages_v_blocks_contact_info_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_contact_info"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_contact_info_links_order_idx" ON "pages_blocks_contact_info_links" USING btree ("_order");
  CREATE INDEX "pages_blocks_contact_info_links_parent_id_idx" ON "pages_blocks_contact_info_links" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_contact_info_links_order_idx" ON "_pages_v_blocks_contact_info_links" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_contact_info_links_parent_id_idx" ON "_pages_v_blocks_contact_info_links" USING btree ("_parent_id");
  ALTER TABLE "pages_blocks_contact_info" DROP COLUMN IF EXISTS "email";
  ALTER TABLE "_pages_v_blocks_contact_info" DROP COLUMN IF EXISTS "email";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_contact_info_links" RENAME TO "pages_blocks_contact_info_telegram_channels";
  ALTER TABLE "_pages_v_blocks_contact_info_links" RENAME TO "_pages_v_blocks_contact_info_telegram_channels";
  ALTER TABLE "pages_blocks_contact_info_telegram_channels" RENAME COLUMN "label" TO "name";
  ALTER TABLE "_pages_v_blocks_contact_info_telegram_channels" RENAME COLUMN "label" TO "name";
  ALTER TABLE "pages_blocks_contact_info_telegram_channels" DROP CONSTRAINT "pages_blocks_contact_info_links_parent_id_fk";
  
  ALTER TABLE "_pages_v_blocks_contact_info_telegram_channels" DROP CONSTRAINT "_pages_v_blocks_contact_info_links_parent_id_fk";
  
  DROP INDEX "pages_blocks_contact_info_links_order_idx";
  DROP INDEX "pages_blocks_contact_info_links_parent_id_idx";
  DROP INDEX "_pages_v_blocks_contact_info_links_order_idx";
  DROP INDEX "_pages_v_blocks_contact_info_links_parent_id_idx";
  ALTER TABLE "pages_blocks_contact_info" ADD COLUMN "email" varchar;
  ALTER TABLE "_pages_v_blocks_contact_info" ADD COLUMN "email" varchar;
  ALTER TABLE "pages_blocks_contact_info_telegram_channels" ADD CONSTRAINT "pages_blocks_contact_info_telegram_channels_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_contact_info"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_contact_info_telegram_channels" ADD CONSTRAINT "_pages_v_blocks_contact_info_telegram_channels_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_contact_info"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_contact_info_telegram_channels_order_idx" ON "pages_blocks_contact_info_telegram_channels" USING btree ("_order");
  CREATE INDEX "pages_blocks_contact_info_telegram_channels_parent_id_idx" ON "pages_blocks_contact_info_telegram_channels" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_contact_info_telegram_channels_order_idx" ON "_pages_v_blocks_contact_info_telegram_channels" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_contact_info_telegram_channels_parent_id_idx" ON "_pages_v_blocks_contact_info_telegram_channels" USING btree ("_parent_id");
  ALTER TABLE "pages_blocks_committee" DROP COLUMN "email";
  ALTER TABLE "pages_blocks_contact_info_telegram_channels" DROP COLUMN "type";
  ALTER TABLE "_pages_v_blocks_committee" DROP COLUMN "email";
  ALTER TABLE "_pages_v_blocks_contact_info_telegram_channels" DROP COLUMN "type";
  DROP TYPE "public"."enum_pages_blocks_contact_info_links_type";
  DROP TYPE "public"."enum__pages_v_blocks_contact_info_links_type";`)
}
