import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "pages_blocks_calendar_embed" ADD COLUMN IF NOT EXISTS "public_events_calendar_id" varchar;
    ALTER TABLE "_pages_v_blocks_calendar_embed" ADD COLUMN IF NOT EXISTS "public_events_calendar_id" varchar;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "pages_blocks_calendar_embed" DROP COLUMN IF EXISTS "public_events_calendar_id";
    ALTER TABLE "_pages_v_blocks_calendar_embed" DROP COLUMN IF EXISTS "public_events_calendar_id";
  `)
}
