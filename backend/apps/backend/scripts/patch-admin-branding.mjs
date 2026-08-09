import { readdir, readFile, writeFile } from "fs/promises"
import { join } from "path"

/**
 * Medusa v2 has no supported config for renaming the admin dashboard's
 * pre-login branding — confirmed by testing the documented
 * `src/admin/i18n` translation-override extension point directly: it
 * deep-merges into the SAME resources object Medusa's own dashboard
 * strings live in at source, but empirically (built and grepped the
 * output) that merge does not survive into `medusa build`'s compiled
 * bundle, so overriding `login.title` there has no effect. The only
 * thing that reliably works is rewriting the literal strings in the
 * already-built static assets, after `medusa build` produces them.
 *
 * Runs as a `postbuild` step (see package.json) so it re-applies on
 * every deploy automatically — nothing to remember to redo by hand.
 * Deliberately a plain exact-string replace, not a regex or AST patch:
 * if a future Medusa version rewords the login screen, this becomes a
 * silent no-op (logged as 0 replacements) rather than a broken build.
 */
const ASSETS_DIR = join(
  import.meta.dirname,
  "..",
  ".medusa/server/public/admin/assets"
)

const REPLACEMENTS = [
  ['"Welcome to Medusa"', '"Welcome to LiquorCentral"'],
]

async function main() {
  let files
  try {
    files = (await readdir(ASSETS_DIR)).filter((f) => f.endsWith(".js"))
  } catch {
    console.log(
      `[patch-admin-branding] ${ASSETS_DIR} not found — admin wasn't built, skipping.`
    )
    return
  }

  let totalReplacements = 0
  for (const file of files) {
    const path = join(ASSETS_DIR, file)
    let contents = await readFile(path, "utf-8")
    let fileReplacements = 0

    for (const [from, to] of REPLACEMENTS) {
      const count = contents.split(from).length - 1
      if (count > 0) {
        contents = contents.split(from).join(to)
        fileReplacements += count
      }
    }

    if (fileReplacements > 0) {
      await writeFile(path, contents, "utf-8")
      totalReplacements += fileReplacements
    }
  }

  console.log(
    `[patch-admin-branding] made ${totalReplacements} replacement(s) across ${files.length} asset file(s).`
  )
}

main()
