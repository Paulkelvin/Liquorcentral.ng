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
 * thing that reliably works is rewriting the literal strings (and, for
 * the login/invite icon, the literal compiled markup) in the
 * already-built static assets, after `medusa build` produces them.
 *
 * Runs as a `postbuild` step (see package.json) so it re-applies on
 * every deploy automatically — nothing to remember to redo by hand.
 * Deliberately a plain exact-string replace, not a regex or AST patch:
 * if a future Medusa version rewords the login screen (or reshuffles
 * its compiled JSX), this becomes a silent no-op (logged as 0
 * replacements) rather than a broken build.
 */
const ASSETS_DIR = join(
  import.meta.dirname,
  "..",
  ".medusa/server/public/admin/assets"
)

/**
 * The generic Medusa "M" mark @medusajs/dashboard inlines as raw SVG on
 * the login/invite screens (`AvatarBox`/`LogoBox` — there is no prop or
 * theme token for it, it is drawn directly in the component). Captured
 * verbatim from a real build via a string-literal-aware bracket scanner
 * (matching parens/braces while skipping over quoted string contents,
 * so the SVG path data's own commas and letters cannot desync the
 * count) — see the git history of this file for that scanner, kept out
 * of the shipped script since it is a one-time extraction, not
 * something that needs to run on every deploy.
 */
const OLD_LOGIN_ICON = `t.jsxs("svg",{className:"rounded-[10px]",viewBox:"0 0 400 400",fill:"none",xmlns:"http://www.w3.org/2000/svg",children:[t.jsx("rect",{width:"400",height:"400",fill:"#18181B"}),t.jsx("path",{d:"M238.088 51.1218L238.089 51.1223L310.605 92.8101C334.028 106.308 348.526 131.32 347.868 157.953L347.867 157.966V157.978V241.688C347.867 268.68 333.687 293.362 310.271 306.856L310.269 306.858L237.754 348.878C214.336 362.374 185.643 362.374 162.225 348.878L89.7127 306.859C66.6206 293.361 52.1113 268.674 52.1113 241.688V157.978C52.1113 131.326 66.6211 106.307 89.7088 92.8093C89.7101 92.8085 89.7114 92.8078 89.7127 92.807L162.556 51.1233L162.559 51.1218C185.977 37.6261 214.67 37.6261 238.088 51.1218ZM124.634 200C124.634 241.576 158.502 275.372 200.156 275.372C242.142 275.372 276.013 241.578 276.013 200C276.013 158.419 241.805 124.628 200.156 124.628C158.502 124.628 124.634 158.424 124.634 200Z",fill:"url(#paint0_linear_11869_12671)",stroke:"url(#paint1_linear_11869_12671)",strokeWidth:"2"}),t.jsxs("defs",{children:[t.jsxs("linearGradient",{id:"paint0_linear_11869_12671",x1:"200",y1:"40",x2:"200",y2:"360",gradientUnits:"userSpaceOnUse",children:[t.jsx("stop",{stopColor:"white"}),t.jsx("stop",{offset:"1",stopColor:"white",stopOpacity:"0.7"})]}),t.jsxs("linearGradient",{id:"paint1_linear_11869_12671",x1:"200",y1:"40",x2:"200",y2:"360",gradientUnits:"userSpaceOnUse",children:[t.jsx("stop",{stopColor:"white",stopOpacity:"0"}),t.jsx("stop",{offset:"1",stopColor:"white",stopOpacity:"0.7"})]})]})]})`

async function buildReplacements() {
  const logoPath = join(import.meta.dirname, "assets", "liquorcentral-logo.png")
  const logoBase64 = await readFile(logoPath, "base64")

  return [
    ['"Welcome to Medusa"', '"Welcome to LiquorCentral"'],
    // The post-account-creation success screen (invite.successHint/
    // successAction in the vendored i18n bundle) — missed in the first
    // pass, which only covered the login/invite screens' shared title.
    // Paul, seeing it live: "I don't want this Medusa thing there."
    [
      '"Get started with Medusa Admin right away."',
      '"Get started with LiquorCentral Admin right away."',
    ],
    ['"Start Medusa Admin"', '"Start LiquorCentral Admin"'],
    // The icon box itself — Paul: "this is the logo I like there... it's
    // on the website" (pointing at the department switcher's
    // LiquorCentralNg mark). Widened from a 50×50 square to fit the
    // logo's real ~3.4:1 aspect ratio instead of squeezing it down to
    // an illegible sliver, and switched to a white ground since the
    // logo PNG is transparent and the brand's own usage of it (the nav
    // switcher, the same screenshot) is always on white.
    [
      `"bg-ui-button-neutral shadow-buttons-neutral after:button-neutral-gradient relative mb-4 flex h-[50px] w-[50px] items-center justify-center rounded-xl after:inset-0 after:content-['']"`,
      `"bg-white shadow-buttons-neutral relative mb-4 flex h-[54px] w-[150px] items-center justify-center rounded-xl p-2"`,
    ],
    [
      OLD_LOGIN_ICON,
      `t.jsx("img",{className:"h-full w-full object-contain",src:"data:image/png;base64,${logoBase64}",alt:"LiquorCentral"})`,
    ],
  ]
}

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

  const REPLACEMENTS = await buildReplacements()

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
