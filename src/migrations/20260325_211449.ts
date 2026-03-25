import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_access_request_form_rules_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_pages_blocks_access_request_form_spaces_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_pages_blocks_access_request_form_calendar_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__pages_v_blocks_access_request_form_rules_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__pages_v_blocks_access_request_form_spaces_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__pages_v_blocks_access_request_form_calendar_link_type" AS ENUM('reference', 'custom');
  ALTER TABLE "pages_blocks_access_request_form" ADD COLUMN "enable_rules_link" boolean DEFAULT false;
  ALTER TABLE "pages_blocks_access_request_form" ADD COLUMN "rules_link_type" "enum_pages_blocks_access_request_form_rules_link_type" DEFAULT 'reference';
  ALTER TABLE "pages_blocks_access_request_form" ADD COLUMN "rules_link_new_tab" boolean;
  ALTER TABLE "pages_blocks_access_request_form" ADD COLUMN "rules_link_url" varchar;
  ALTER TABLE "pages_blocks_access_request_form" ADD COLUMN "enable_spaces_link" boolean DEFAULT false;
  ALTER TABLE "pages_blocks_access_request_form" ADD COLUMN "spaces_link_type" "enum_pages_blocks_access_request_form_spaces_link_type" DEFAULT 'reference';
  ALTER TABLE "pages_blocks_access_request_form" ADD COLUMN "spaces_link_new_tab" boolean;
  ALTER TABLE "pages_blocks_access_request_form" ADD COLUMN "spaces_link_url" varchar;
  ALTER TABLE "pages_blocks_access_request_form" ADD COLUMN "enable_calendar_link" boolean DEFAULT false;
  ALTER TABLE "pages_blocks_access_request_form" ADD COLUMN "calendar_link_type" "enum_pages_blocks_access_request_form_calendar_link_type" DEFAULT 'reference';
  ALTER TABLE "pages_blocks_access_request_form" ADD COLUMN "calendar_link_new_tab" boolean;
  ALTER TABLE "pages_blocks_access_request_form" ADD COLUMN "calendar_link_url" varchar;
  ALTER TABLE "_pages_v_blocks_access_request_form" ADD COLUMN "enable_rules_link" boolean DEFAULT false;
  ALTER TABLE "_pages_v_blocks_access_request_form" ADD COLUMN "rules_link_type" "enum__pages_v_blocks_access_request_form_rules_link_type" DEFAULT 'reference';
  ALTER TABLE "_pages_v_blocks_access_request_form" ADD COLUMN "rules_link_new_tab" boolean;
  ALTER TABLE "_pages_v_blocks_access_request_form" ADD COLUMN "rules_link_url" varchar;
  ALTER TABLE "_pages_v_blocks_access_request_form" ADD COLUMN "enable_spaces_link" boolean DEFAULT false;
  ALTER TABLE "_pages_v_blocks_access_request_form" ADD COLUMN "spaces_link_type" "enum__pages_v_blocks_access_request_form_spaces_link_type" DEFAULT 'reference';
  ALTER TABLE "_pages_v_blocks_access_request_form" ADD COLUMN "spaces_link_new_tab" boolean;
  ALTER TABLE "_pages_v_blocks_access_request_form" ADD COLUMN "spaces_link_url" varchar;
  ALTER TABLE "_pages_v_blocks_access_request_form" ADD COLUMN "enable_calendar_link" boolean DEFAULT false;
  ALTER TABLE "_pages_v_blocks_access_request_form" ADD COLUMN "calendar_link_type" "enum__pages_v_blocks_access_request_form_calendar_link_type" DEFAULT 'reference';
  ALTER TABLE "_pages_v_blocks_access_request_form" ADD COLUMN "calendar_link_new_tab" boolean;
  ALTER TABLE "_pages_v_blocks_access_request_form" ADD COLUMN "calendar_link_url" varchar;
  ALTER TABLE "pages_blocks_access_request_form" DROP COLUMN IF EXISTS "rules_page_link";
  ALTER TABLE "pages_blocks_access_request_form" DROP COLUMN IF EXISTS "spaces_info_link";
  ALTER TABLE "pages_blocks_access_request_form" DROP COLUMN IF EXISTS "calendar_link";
  ALTER TABLE "pages_blocks_access_request_form_locales" DROP COLUMN IF EXISTS "language";
  ALTER TABLE "_pages_v_blocks_access_request_form" DROP COLUMN IF EXISTS "rules_page_link";
  ALTER TABLE "_pages_v_blocks_access_request_form" DROP COLUMN IF EXISTS "spaces_info_link";
  ALTER TABLE "_pages_v_blocks_access_request_form" DROP COLUMN IF EXISTS "calendar_link";
  ALTER TABLE "_pages_v_blocks_access_request_form_locales" DROP COLUMN IF EXISTS "language";
  DROP TYPE IF EXISTS "public"."enum_pages_blocks_access_request_form_language";
  DROP TYPE IF EXISTS "public"."enum__pages_v_blocks_access_request_form_language";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_access_request_form_language" AS ENUM('fi', 'en');
  CREATE TYPE "public"."enum__pages_v_blocks_access_request_form_language" AS ENUM('fi', 'en');
  ALTER TABLE "pages_blocks_access_request_form" ADD COLUMN "rules_page_link" varchar;
  ALTER TABLE "pages_blocks_access_request_form" ADD COLUMN "spaces_info_link" varchar;
  ALTER TABLE "pages_blocks_access_request_form" ADD COLUMN "calendar_link" varchar;
  ALTER TABLE "pages_blocks_access_request_form_locales" ADD COLUMN "language" "enum_pages_blocks_access_request_form_language" DEFAULT 'fi';
  ALTER TABLE "_pages_v_blocks_access_request_form" ADD COLUMN "rules_page_link" varchar;
  ALTER TABLE "_pages_v_blocks_access_request_form" ADD COLUMN "spaces_info_link" varchar;
  ALTER TABLE "_pages_v_blocks_access_request_form" ADD COLUMN "calendar_link" varchar;
  ALTER TABLE "_pages_v_blocks_access_request_form_locales" ADD COLUMN "language" "enum__pages_v_blocks_access_request_form_language" DEFAULT 'fi';
  ALTER TABLE "pages_blocks_access_request_form" DROP COLUMN "enable_rules_link";
  ALTER TABLE "pages_blocks_access_request_form" DROP COLUMN "rules_link_type";
  ALTER TABLE "pages_blocks_access_request_form" DROP COLUMN "rules_link_new_tab";
  ALTER TABLE "pages_blocks_access_request_form" DROP COLUMN "rules_link_url";
  ALTER TABLE "pages_blocks_access_request_form" DROP COLUMN "enable_spaces_link";
  ALTER TABLE "pages_blocks_access_request_form" DROP COLUMN "spaces_link_type";
  ALTER TABLE "pages_blocks_access_request_form" DROP COLUMN "spaces_link_new_tab";
  ALTER TABLE "pages_blocks_access_request_form" DROP COLUMN "spaces_link_url";
  ALTER TABLE "pages_blocks_access_request_form" DROP COLUMN "enable_calendar_link";
  ALTER TABLE "pages_blocks_access_request_form" DROP COLUMN "calendar_link_type";
  ALTER TABLE "pages_blocks_access_request_form" DROP COLUMN "calendar_link_new_tab";
  ALTER TABLE "pages_blocks_access_request_form" DROP COLUMN "calendar_link_url";
  ALTER TABLE "_pages_v_blocks_access_request_form" DROP COLUMN "enable_rules_link";
  ALTER TABLE "_pages_v_blocks_access_request_form" DROP COLUMN "rules_link_type";
  ALTER TABLE "_pages_v_blocks_access_request_form" DROP COLUMN "rules_link_new_tab";
  ALTER TABLE "_pages_v_blocks_access_request_form" DROP COLUMN "rules_link_url";
  ALTER TABLE "_pages_v_blocks_access_request_form" DROP COLUMN "enable_spaces_link";
  ALTER TABLE "_pages_v_blocks_access_request_form" DROP COLUMN "spaces_link_type";
  ALTER TABLE "_pages_v_blocks_access_request_form" DROP COLUMN "spaces_link_new_tab";
  ALTER TABLE "_pages_v_blocks_access_request_form" DROP COLUMN "spaces_link_url";
  ALTER TABLE "_pages_v_blocks_access_request_form" DROP COLUMN "enable_calendar_link";
  ALTER TABLE "_pages_v_blocks_access_request_form" DROP COLUMN "calendar_link_type";
  ALTER TABLE "_pages_v_blocks_access_request_form" DROP COLUMN "calendar_link_new_tab";
  ALTER TABLE "_pages_v_blocks_access_request_form" DROP COLUMN "calendar_link_url";
  DROP TYPE "public"."enum_pages_blocks_access_request_form_rules_link_type";
  DROP TYPE "public"."enum_pages_blocks_access_request_form_spaces_link_type";
  DROP TYPE "public"."enum_pages_blocks_access_request_form_calendar_link_type";
  DROP TYPE "public"."enum__pages_v_blocks_access_request_form_rules_link_type";
  DROP TYPE "public"."enum__pages_v_blocks_access_request_form_spaces_link_type";
  DROP TYPE "public"."enum__pages_v_blocks_access_request_form_calendar_link_type";`)
}
