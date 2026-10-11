import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  -- Fill the key before the column is made NOT NULL. Keeping this in the
  -- migration means the two can never be run in the wrong order, and a target
  -- missing from this map fails the migration loudly instead of reaching
  -- production unable to accept a single reservation.
  UPDATE "reservation_targets" AS t
  SET "sheet_venue_key" = v.key::"public"."enum_reservation_targets_sheet_venue_key"
  FROM (VALUES
    ('jmt10cd', 'JMT 10 CD'),
    ('jmt10h', 'JMT 10 H'),
    ('jmt11ab', 'JMT 11 AB'),
    ('jmt11cd', 'JMT 11 CD'),
    ('smt3', 'SMT 3 A'),
    ('sk5b', 'SK 5 B'),
    ('sk6d', 'SK 6 D'),
    ('jmt11b_mekaniikka', 'JMT 11 B Mekaniikkapaja'),
    ('sk6c_puu', 'SK 6 C Puutyöpaja'),
    ('jmt10d_soitto', 'JMT 10 D Soittohuone'),
    ('jmt11m_kontti', 'Kajakit ja SUP-laudat'),
    ('jmt11cd_varasto', 'Lainatavarat')
  ) AS v(prefix, key)
  WHERE t."email_prefix" = v.prefix AND t."sheet_venue_key" IS NULL;

  ALTER TABLE "reservation_targets" ALTER COLUMN "sheet_venue_key" SET NOT NULL;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "reservation_targets" ALTER COLUMN "sheet_venue_key" DROP NOT NULL;`)
}
