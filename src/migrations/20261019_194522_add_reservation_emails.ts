import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_access_request_submissions_requester_emails_type" AS ENUM('received', 'accepted', 'declined');
  CREATE TYPE "public"."enum_access_request_submissions_requester_emails_status" AS ENUM('sent', 'failed', 'not-configured');
  CREATE TABLE "access_request_submissions_requester_emails" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"type" "enum_access_request_submissions_requester_emails_type" NOT NULL,
  	"status" "enum_access_request_submissions_requester_emails_status" NOT NULL,
  	"at" timestamp(3) with time zone NOT NULL,
  	"error" varchar
  );
  
  CREATE TABLE "reservation_emails" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"reply_to" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "reservation_emails_locales" (
  	"signature" varchar,
  	"received_subject" varchar,
  	"received_intro" varchar,
  	"accepted_subject" varchar,
  	"accepted_intro" varchar,
  	"declined_subject" varchar,
  	"declined_intro" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "access_request_submissions" ADD COLUMN "decided_by_email" varchar;
  ALTER TABLE "access_request_submissions" ADD COLUMN "decided_by_telegram" varchar;
  ALTER TABLE "access_request_submissions_requester_emails" ADD CONSTRAINT "access_request_submissions_requester_emails_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."access_request_submissions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "reservation_emails_locales" ADD CONSTRAINT "reservation_emails_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."reservation_emails"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "access_request_submissions_requester_emails_order_idx" ON "access_request_submissions_requester_emails" USING btree ("_order");
  CREATE INDEX "access_request_submissions_requester_emails_parent_id_idx" ON "access_request_submissions_requester_emails" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "reservation_emails_locales_locale_parent_id_unique" ON "reservation_emails_locales" USING btree ("_locale","_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "access_request_submissions_requester_emails" CASCADE;
  DROP TABLE "reservation_emails" CASCADE;
  DROP TABLE "reservation_emails_locales" CASCADE;
  ALTER TABLE "access_request_submissions" DROP COLUMN "decided_by_email";
  ALTER TABLE "access_request_submissions" DROP COLUMN "decided_by_telegram";
  DROP TYPE "public"."enum_access_request_submissions_requester_emails_type";
  DROP TYPE "public"."enum_access_request_submissions_requester_emails_status";`)
}
