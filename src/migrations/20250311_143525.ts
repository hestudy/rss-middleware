import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_prompts_middleware" AS ENUM('translate', 'summary');
  ALTER TYPE "public"."enum_payload_jobs_log_task_slug" ADD VALUE 'fetchAndSaveRss';
  ALTER TYPE "public"."enum_payload_jobs_log_task_slug" ADD VALUE 'translateRss';
  ALTER TYPE "public"."enum_payload_jobs_task_slug" ADD VALUE 'fetchAndSaveRss';
  ALTER TYPE "public"."enum_payload_jobs_task_slug" ADD VALUE 'translateRss';
  ALTER TABLE "prompts" ADD COLUMN "middleware" "enum_prompts_middleware" DEFAULT 'translate' NOT NULL;
  ALTER TABLE "links" ADD COLUMN "enabled" boolean DEFAULT true;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "prompts" DROP COLUMN IF EXISTS "middleware";
  ALTER TABLE "links" DROP COLUMN IF EXISTS "enabled";
  ALTER TABLE "public"."payload_jobs_log" ALTER COLUMN "task_slug" SET DATA TYPE text;
  DROP TYPE "public"."enum_payload_jobs_log_task_slug";
  CREATE TYPE "public"."enum_payload_jobs_log_task_slug" AS ENUM('inline');
  ALTER TABLE "public"."payload_jobs_log" ALTER COLUMN "task_slug" SET DATA TYPE "public"."enum_payload_jobs_log_task_slug" USING "task_slug"::"public"."enum_payload_jobs_log_task_slug";
  ALTER TABLE "public"."payload_jobs" ALTER COLUMN "task_slug" SET DATA TYPE text;
  DROP TYPE "public"."enum_payload_jobs_task_slug";
  CREATE TYPE "public"."enum_payload_jobs_task_slug" AS ENUM('inline');
  ALTER TABLE "public"."payload_jobs" ALTER COLUMN "task_slug" SET DATA TYPE "public"."enum_payload_jobs_task_slug" USING "task_slug"::"public"."enum_payload_jobs_task_slug";
  DROP TYPE "public"."enum_prompts_middleware";`)
}
