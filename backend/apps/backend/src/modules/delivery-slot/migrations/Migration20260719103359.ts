import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260719103359 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "delivery_slot" ("id" text not null, "starts_at" timestamptz not null, "ends_at" timestamptz not null, "cutoff_at" timestamptz null, "capacity" integer not null, "booked_count" integer not null default 0, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "delivery_slot_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_delivery_slot_deleted_at" ON "delivery_slot" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "delivery_slot" cascade;`);
  }

}
