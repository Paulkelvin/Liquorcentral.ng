import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260719083045 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "wine_details" ("id" text not null, "vintage" integer null, "producer" text null, "region" text null, "bottle_size" text null, "tasting_notes" text null, "serving_temperature" text null, "abv" real null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "wine_details_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_wine_details_deleted_at" ON "wine_details" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "wine_details" cascade;`);
  }

}
