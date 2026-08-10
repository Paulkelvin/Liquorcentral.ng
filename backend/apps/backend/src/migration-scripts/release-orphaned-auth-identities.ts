import { ExecArgs, IAuthModuleService, IUserModuleService } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

/**
 * Frees admin email addresses that were bricked by deleting their user.
 *
 * Deleting an admin user removes the `user` row but leaves its auth
 * identity — the record that owns the email and password — behind, with
 * its link nulled to `{ user_id: null }`. That orphan keeps the address
 * claimed forever: re-inviting it fails with "Identity with email already
 * exists", the dashboard's log-in-instead fallback fails too (the orphan
 * still holds the *old* password), and the invite screen shows only
 * "Server error - Try again later." Paul hit this on two addresses after
 * deleting the accounts he had just created.
 *
 * `subscribers/user-deleted-auth-cleanup.ts` stops new orphans being
 * created, but cannot help addresses already stuck from before it
 * existed. This runs on every deploy (see `backend/railway.json`) and
 * clears that pre-existing damage, so a bricked address can simply be
 * re-invited from Settings → Users like any other — no environment
 * variables, no manual recovery step.
 *
 * **What it will not touch**, verified against the real shapes in the
 * database rather than assumed:
 *
 *   - an invite in flight (registered, not yet accepted) has **no**
 *     `app_metadata` at all, so it never matches;
 *   - a storefront customer carries `{ customer_id: ... }` and no
 *     `user_id` key, so it never matches;
 *   - a healthy admin's `user_id` resolves to a live user.
 *
 * Only an identity that explicitly carries a `user_id` key which no
 * longer resolves to a real user is released — precisely the
 * deleted-admin case. Idempotent: on a healthy database it finds nothing
 * and logs that it did nothing.
 */
const PAGE_SIZE = 200

export default async function releaseOrphanedAuthIdentities({
  container,
}: ExecArgs) {
  const authModuleService: IAuthModuleService = container.resolve(Modules.AUTH)
  const userModuleService: IUserModuleService = container.resolve(Modules.USER)
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  const orphanIds: string[] = []
  const orphanEmails: string[] = []
  let skip = 0

  for (;;) {
    const identities = await authModuleService.listAuthIdentities(
      {},
      { skip, take: PAGE_SIZE, relations: ["provider_identities"] }
    )

    if (!identities.length) {
      break
    }

    for (const identity of identities) {
      const metadata = identity.app_metadata

      // No metadata at all => a registration that has not been linked to
      // anything yet (an invite mid-flight). Leave it alone.
      if (!metadata || !("user_id" in metadata)) {
        continue
      }

      const userId = metadata.user_id as string | null

      if (userId) {
        const [owner] = await userModuleService.listUsers({ id: userId })
        if (owner) {
          continue // healthy admin
        }
      }

      orphanIds.push(identity.id)
      const email = identity.provider_identities?.find(
        (provider) => provider.provider === "emailpass"
      )?.entity_id
      if (email) {
        orphanEmails.push(email)
      }
    }

    if (identities.length < PAGE_SIZE) {
      break
    }
    skip += PAGE_SIZE
  }

  if (!orphanIds.length) {
    logger.info(
      "[release-orphaned-auth-identities] No orphaned admin auth identities found."
    )
    return
  }

  await authModuleService.deleteAuthIdentities(orphanIds)

  logger.info(
    `[release-orphaned-auth-identities] Released ${orphanIds.length} orphaned admin auth identit(ies), freeing: ${
      orphanEmails.join(", ") || "(addresses unknown)"
    }`
  )
}
