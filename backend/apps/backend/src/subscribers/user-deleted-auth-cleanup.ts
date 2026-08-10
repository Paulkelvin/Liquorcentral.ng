import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import type {
  IAuthModuleService,
  IUserModuleService,
} from "@medusajs/framework/types"

/**
 * Deleting an admin user in the dashboard leaves its **auth identity**
 * behind — Medusa deletes the `user` row but never the credential record
 * that owns that email address. The leftover identity keeps the email
 * permanently claimed while belonging to nobody
 * (`app_metadata: { user_id: null }`), which silently bricks the address:
 *
 *   - `POST /auth/user/emailpass/register` → 401 "Identity with email
 *     already exists", so a fresh invite can never be accepted;
 *   - the dashboard's own fallback (log in instead of register) then also
 *     fails, because the orphan still carries the *original* password,
 *     not the one being typed into the invite form;
 *   - both failures land in the invite screen's catch-all, which is why
 *     this surfaced only as an unexplained **"Server error - Try again
 *     later."** — reproduced end to end locally before this fix.
 *
 * The address cannot be recovered from any admin screen: deleting the
 * (already deleted) user again does nothing, and re-inviting reissues a
 * token that fails identically. Paul hit exactly this on two addresses
 * in a row after deleting the accounts he had just created.
 *
 * The identity is found by **email**, not by `app_metadata.user_id`:
 * Medusa nulls that link out as part of deleting the user, so by the time
 * this handler runs there is nothing left pointing back at the user
 * (verified directly — filtering identities by the deleted user's id
 * returns zero rows). The email is recovered from the soft-deleted user
 * row itself, which `withDeleted` still returns.
 *
 * Only identities that are unclaimed (`user_id` null) or still claimed by
 * this exact user are removed, so an address legitimately re-registered
 * by someone else in the meantime is never touched.
 *
 * Deliberately non-fatal: a failure here must never take down user
 * deletion itself, so it logs and returns rather than throwing.
 */
export default async function userDeletedAuthCleanupHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string } | { id: string }[]>) {
  const authModuleService: IAuthModuleService = container.resolve(Modules.AUTH)
  const userModuleService: IUserModuleService = container.resolve(Modules.USER)
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  // The user module emits this event with a single object for a single
  // delete and an array for a bulk delete; normalise both.
  const deletedIds = (Array.isArray(data) ? data : [data])
    .map((entry) => entry?.id)
    .filter((id): id is string => Boolean(id))

  for (const userId of deletedIds) {
    try {
      const [deletedUser] = await userModuleService.listUsers(
        { id: userId },
        { withDeleted: true }
      )

      if (!deletedUser?.email) {
        continue
      }

      const identities = await authModuleService.listAuthIdentities({
        provider_identities: {
          entity_id: deletedUser.email,
          provider: "emailpass",
        },
      })

      const releasable = identities.filter((identity) => {
        const owner = identity.app_metadata?.user_id
        return !owner || owner === userId
      })

      if (!releasable.length) {
        continue
      }

      await authModuleService.deleteAuthIdentities(releasable.map((i) => i.id))
      logger.info(
        `[user-deleted-auth-cleanup] Released ${releasable.length} auth identit(ies) so ${deletedUser.email} can be invited again.`
      )
    } catch (error) {
      logger.error(
        `[user-deleted-auth-cleanup] Could not clean up auth identity for deleted user ${userId}: ${
          (error as Error).message
        }`
      )
    }
  }
}

export const config: SubscriberConfig = {
  event: "user.user.deleted",
}
