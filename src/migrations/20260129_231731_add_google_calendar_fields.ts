import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_calendar_embed" ADD COLUMN "use_combined_calendars" boolean DEFAULT false;
  ALTER TABLE "_pages_v_blocks_calendar_embed" ADD COLUMN "use_combined_calendars" boolean DEFAULT false;
  ALTER TABLE "reservation_targets" ADD COLUMN "google_calendar_id" varchar;
  ALTER TABLE "reservation_targets" ADD COLUMN "calendar_color" varchar DEFAULT '#3F51B5';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_calendar_embed" DROP COLUMN "use_combined_calendars";
  ALTER TABLE "_pages_v_blocks_calendar_embed" DROP COLUMN "use_combined_calendars";
  ALTER TABLE "reservation_targets" DROP COLUMN "google_calendar_id";
  ALTER TABLE "reservation_targets" DROP COLUMN "calendar_color";`)
}
