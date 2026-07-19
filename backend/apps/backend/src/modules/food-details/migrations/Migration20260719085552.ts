import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260719085552 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "food_details" ("id" text not null, "ingredients" text[] null, "allergens" text[] null, "dietary_flags" text[] null, "safety_data_verified" boolean not null default false, "spice_level" integer null, "prep_time_minutes" integer null, "portion_size" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "food_details_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_food_details_deleted_at" ON "food_details" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "food_details" cascade;`);
  }

}
