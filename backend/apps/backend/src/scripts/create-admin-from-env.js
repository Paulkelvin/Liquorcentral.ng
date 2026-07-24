export default async function ({ container }) {
  const email = process.env.ADMIN_EMAIL
  const password = process.env.ADMIN_PASSWORD

  if (!email || !password) {
    console.log("[create-admin-from-env] ADMIN_EMAIL/ADMIN_PASSWORD not set, skipping.")
    return
  }

  const userModuleService = container.resolve("user")

  const existing = await userModuleService.listUsers({ email })
  if (existing.length > 0) {
    console.log(`[create-admin-from-env] Admin user ${email} already exists, skipping.`)
    return
  }

  const authService = container.resolve("auth")
  const workflowService = container.resolve("workflows")

  const { result: users } = await workflowService.run("create-users-workflow", {
    input: { users: [{ email }] },
  })
  const user = users[0]

  const { authIdentity, error } = await authService.register("emailpass", {
    body: { email, password },
  })

  if (error) {
    console.error(`[create-admin-from-env] Failed to register auth identity: ${error}`)
    return
  }

  await authService.updateAuthIdentities({
    id: authIdentity.id,
    app_metadata: { user_id: user.id },
  })

  console.log(`[create-admin-from-env] Admin user ${email} created successfully.`)
}
