import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_reservation_targets_sheet_venue_key" AS ENUM('Lainatavarat', 'JMT 10 CD', 'JMT 10 D Soittohuone', 'JMT 10 H', 'JMT 11 AB', 'JMT 11 B Mekaniikkapaja', 'JMT 11 CD', 'SK 5 B', 'SK 6 C Puutyöpaja', 'SK 6 D', 'SMT 3 A', 'Kajakit ja SUP-laudat');
  CREATE TYPE "public"."enum_access_request_submissions_status" AS ENUM('pending', 'accepted', 'declined');
  CREATE TYPE "public"."enum_access_request_submissions_sheet_sync_status" AS ENUM('not-written', 'written', 'failed');
  CREATE TABLE "reservation_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"keyholder_cache" jsonb,
  	"keyholder_cache_updated_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "reservation_targets" ADD COLUMN "sheet_venue_key" "enum_reservation_targets_sheet_venue_key";
  ALTER TABLE "access_request_submissions" ADD COLUMN "status" "enum_access_request_submissions_status" DEFAULT 'pending';
  ALTER TABLE "access_request_submissions" ADD COLUMN "decided_by" varchar;
  ALTER TABLE "access_request_submissions" ADD COLUMN "decided_by_telegram_id" varchar;
  ALTER TABLE "access_request_submissions" ADD COLUMN "decided_at" timestamp(3) with time zone;
  ALTER TABLE "access_request_submissions" ADD COLUMN "decline_reason" varchar;
  ALTER TABLE "access_request_submissions" ADD COLUMN "telegram_message_id" varchar;
  ALTER TABLE "access_request_submissions" ADD COLUMN "telegram_topic_id" varchar;
  ALTER TABLE "access_request_submissions" ADD COLUMN "sheet_sync_status" "enum_access_request_submissions_sheet_sync_status" DEFAULT 'not-written';
  ALTER TABLE "access_request_submissions" ADD COLUMN "sheet_row_number" numeric;
  ALTER TABLE "access_request_submissions" ADD COLUMN "sheet_error" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "reservation_settings" CASCADE;
  ALTER TABLE "reservation_targets" DROP COLUMN "sheet_venue_key";
  ALTER TABLE "access_request_submissions" DROP COLUMN "status";
  ALTER TABLE "access_request_submissions" DROP COLUMN "decided_by";
  ALTER TABLE "access_request_submissions" DROP COLUMN "decided_by_telegram_id";
  ALTER TABLE "access_request_submissions" DROP COLUMN "decided_at";
  ALTER TABLE "access_request_submissions" DROP COLUMN "decline_reason";
  ALTER TABLE "access_request_submissions" DROP COLUMN "telegram_message_id";
  ALTER TABLE "access_request_submissions" DROP COLUMN "telegram_topic_id";
  ALTER TABLE "access_request_submissions" DROP COLUMN "sheet_sync_status";
  ALTER TABLE "access_request_submissions" DROP COLUMN "sheet_row_number";
  ALTER TABLE "access_request_submissions" DROP COLUMN "sheet_error";
  DROP TYPE "public"."enum_reservation_targets_sheet_venue_key";
  DROP TYPE "public"."enum_access_request_submissions_status";
  DROP TYPE "public"."enum_access_request_submissions_sheet_sync_status";`)
}
