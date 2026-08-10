/**
 * Creates — and, when necessary, *repairs* — the admin user described by
 * ADMIN_EMAIL / ADMIN_PASSWORD. Runs on every deploy (see
 * `backend/railway.json`'s preDeployCommand), so it doubles as the
 * break-glass way back into the dashboard when the invite flow can't be
 * used.
 *
 * Why repair, and not just create: deleting an admin user leaves its auth
 * identity behind, still owning that email address but linked to nobody.
 * That orphan makes the address permanently un-invitable — register
 * returns "Identity with email already exists", the dashboard's
 * login-instead fallback fails too (the orphan keeps the *old* password),
 * and the invite screen shows only "Server error - Try again later."
 * `subscribers/user-deleted-auth-cleanup.ts` now prevents new orphans,
 * but this script is what rescues addresses already stuck in that state,
 * including on a database where the damage predates that subscriber.
 *
 * Behaviour:
 *   - healthy account (user + correctly linked identity) → left alone, so
 *     a password changed in the dashboard is never silently reverted by a
 *     deploy;
 *   - anything else (orphaned identity, missing link, deleted user) →
 *     repaired to match ADMIN_EMAIL / ADMIN_PASSWORD;
 *   - ADMIN_FORCE_RESET=true → repair even a healthy account, which is
 *     the deliberate "I've forgotten the admin password" lever.
 */
export default async function ({ container }) {
  const email = process.env.ADMIN_EMAIL
  const password = process.env.ADMIN_PASSWORD
  const forceReset = process.env.ADMIN_FORCE_RESET === "true"

  if (!email || !password) {
    console.log(
      "[create-admin-from-env] ADMIN_EMAIL/ADMIN_PASSWORD not set, skipping."
    )
    return
  }

  const userModuleService = container.resolve("user")
  const authService = container.resolve("auth")
  const workflowService = container.resolve("workflows")

  const existingUsers = await userModuleService.listUsers({ email })
  const user = existingUsers[0]

  // Identities are looked up through the provider identity's `entity_id`
  // (the email as emailpass records it) rather than through the user,
  // because the whole failure mode here is an identity that outlived the
  // user it belonged to and so can't be reached from the user side.
  const identities = await authService.listAuthIdentities({
    provider_identities: { entity_id: email, provider: "emailpass" },
  })

  const isHealthy =
    !!user &&
    identities.some((identity) => identity.app_metadata?.user_id === user.id)

  if (isHealthy && !forceReset) {
    console.log(
      `[create-admin-from-env] Admin user ${email} already exists and is correctly linked, skipping.`
    )
    return
  }

  if (isHealthy && forceReset) {
    console.log(
      `[create-admin-from-env] ADMIN_FORCE_RESET=true — resetting credentials for ${email}.`
    )
  } else if (identities.length || existingUsers.length) {
    console.log(
      `[create-admin-from-env] Repairing ${email}: found ${existingUsers.length} user(s) and ${identities.length} auth identit(ies), but they are not correctly linked.`
    )
  }

  // Drop whatever credential records currently claim this address. This
  // is what actually frees the email; without it `register` below keeps
  // failing with "Identity with email already exists".
  if (identities.length) {
    await authService.deleteAuthIdentities(identities.map((i) => i.id))
  }

  let targetUser = user
  if (!targetUser) {
    const { result } = await workflowService.run("create-users-workflow", {
      input: { users: [{ email }] },
    })
    targetUser = result[0]
  }

  const { authIdentity, error } = await authService.register("emailpass", {
    body: { email, password },
  })

  if (error) {
    console.error(
      `[create-admin-from-env] Failed to register auth identity: ${error}`
    )
    return
  }

  await authService.updateAuthIdentities({
    id: authIdentity.id,
    app_metadata: { user_id: targetUser.id },
  })

  console.log(
    `[create-admin-from-env] Admin user ${email} is ready (user ${targetUser.id}).`
  )
}
