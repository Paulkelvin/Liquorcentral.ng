import { model } from "@medusajs/framework/utils"

/**
 * A bookable, capacity-limited Food Central delivery/pickup time window
 * (TIER_B_DELIVERY_SLOT_MODULE.md §3, §6). Linked to a Fulfillment
 * Shipping Option via src/links/delivery-slot-shipping-option.ts.
 *
 * Same-day and scheduled delivery are one mechanism, not two (§5): a
 * same-day slot is simply a slot whose starts_at falls on today's date
 * and carries a cutoff_at; a scheduled slot is dated in the future and
 * typically has no cutoff. No is_same_day / delivery_vs_pickup
 * discriminator field exists here — computing "same-day" from starts_at
 * vs. the current date is a read-time concern, and the pickup-vs-delivery
 * boundary is explicitly unresolved (§5, §19), so this model does not
 * foreclose either answer by adding a type field.
 *
 * capacity/booked_count are "two numbers, not a computed formula" (§6) —
 * both staff-set/staff-incremented operational data, never derived from
 * any other system's data. Slot length, cutoff timing, and capacity
 * values themselves remain an open operational-parameter business
 * decision (§9, §18, §21) — this model stores whatever values are
 * supplied, it does not propose or default any of them.
 */
export const DeliverySlot = model.define("delivery_slot", {
  id: model.id().primaryKey(),

  /** The bookable window itself (§3, §5) — staff-configured, not computed. */
  starts_at: model.dateTime(),
  ends_at: model.dateTime(),

  /**
   * Same-day cutoff (§5, §7). Nullable: a cutoff is a property of a
   * same-day slot's own timing, not a mechanism every slot necessarily
   * carries (e.g. a scheduled slot may have none).
   */
  cutoff_at: model.dateTime().nullable(),

  /** Capacity limit and current booked count (§6) — reconciling kitchen
   * vs. rider-capacity constraints into this single figure is an
   * operational judgment made by whoever sets it (§6, §18), not an
   * architectural distinction this model represents as separate fields. */
  capacity: model.number(),
  booked_count: model.number().default(0),
})
