import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  -- Same reasoning as the sheet key: fill what is known before the constraint
  -- goes on, so the two cannot be run in the wrong order. A target missing from
  -- this map still fails the migration, which is the right outcome -- it cannot
  -- be booked without a topic and a calendar.
  UPDATE "reservation_targets" AS t
  SET
    "telegram_topic_id" = COALESCE(NULLIF(t."telegram_topic_id", ''), v.topic),
    "google_calendar_id" = COALESCE(NULLIF(t."google_calendar_id", ''), v.calendar)
  FROM (VALUES
    ('jmt10cd', '4376', 'u5fk2i4pnmt950t48lof3tnci8@group.calendar.google.com'),
    ('jmt10h', '4377', 'mb3avdu3moht99lshaut39s4d0@group.calendar.google.com'),
    ('jmt11ab', '4374', '946mj42ahhaqjkqsglldnh268o@group.calendar.google.com'),
    ('jmt11cd', '4375', 'rhebop45ar65somg6v8utf6is8@group.calendar.google.com'),
    ('smt3', '4383', '3q5ec5aquju8monmvjbtcjcgmk@group.calendar.google.com'),
    ('sk5b', '4379', 'ufa2akdfe8fta20ehvn9dl0gmg@group.calendar.google.com'),
    ('sk6d', '4381', '7s5n3fu8u04p7vnqnt7f4i99l4@group.calendar.google.com'),
    ('jmt11b_mekaniikka', '4393', 'd8nbsluvjq5j7nr66am7eg3l3k@group.calendar.google.com'),
    ('sk6c_puu', '4395', 'fkjpivjehh6oa4s4t7rnmot0eo@group.calendar.google.com'),
    ('jmt10d_soitto', '1', '16035e34c19efa67fa66f1f8884457af8add5ccb39f2714790e3ad391af802ea@group.calendar.google.com'),
    ('jmt11cd_varasto', '4397', 'icfq8vqs035esjag36lgacpsq8@group.calendar.google.com'),
    ('jmt11m_kontti', '4392', '035n3m3enug2agplmoe2vk0k9c@group.calendar.google.com')
  ) AS v(prefix, topic, calendar)
  WHERE t."email_prefix" = v.prefix
    AND (
      t."telegram_topic_id" IS NULL OR t."telegram_topic_id" = ''
      OR t."google_calendar_id" IS NULL OR t."google_calendar_id" = ''
    );

  ALTER TABLE "reservation_targets" ALTER COLUMN "telegram_topic_id" SET NOT NULL;
  ALTER TABLE "reservation_targets" ALTER COLUMN "google_calendar_id" SET NOT NULL;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "reservation_targets" ALTER COLUMN "telegram_topic_id" DROP NOT NULL;
  ALTER TABLE "reservation_targets" ALTER COLUMN "google_calendar_id" DROP NOT NULL;`)
}
