import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_access_request_submissions_calendar_sync_status" AS ENUM('not-written', 'written', 'failed');
  ALTER TABLE "access_request_submissions" ADD COLUMN "calendar_event_id" varchar;
  ALTER TABLE "access_request_submissions" ADD COLUMN "calendar_general_event_id" varchar;
  ALTER TABLE "access_request_submissions" ADD COLUMN "calendar_sync_status" "enum_access_request_submissions_calendar_sync_status" DEFAULT 'not-written';
  ALTER TABLE "access_request_submissions" ADD COLUMN "calendar_error" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "access_request_submissions" DROP COLUMN "calendar_event_id";
  ALTER TABLE "access_request_submissions" DROP COLUMN "calendar_general_event_id";
  ALTER TABLE "access_request_submissions" DROP COLUMN "calendar_sync_status";
  ALTER TABLE "access_request_submissions" DROP COLUMN "calendar_error";
  DROP TYPE "public"."enum_access_request_submissions_calendar_sync_status";`)
}
