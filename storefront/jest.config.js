const nextJest = require("next/jest")

// next/jest loads next.config.js, which runs check-env-variables.js — load
// .env.local the same way `next dev`/`next build` do (via Next's own env
// loader) so that check doesn't fail under plain `jest`.
const { loadEnvConfig } = require("@next/env")
loadEnvConfig(process.cwd())

const createJestConfig = nextJest({
  // Path to the Next.js app, for loading next.config.js and .env files.
  dir: "./",
})

/** @type {import('jest').Config} */
const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testEnvironment: "jest-environment-jsdom",
  testMatch: ["**/__tests__/**/*.test.[jt]s?(x)"],
  moduleNameMapper: {
    "^@lib/(.*)$": "<rootDir>/src/lib/$1",
    "^@modules/(.*)$": "<rootDir>/src/modules/$1",
    "^styles/(.*)$": "<rootDir>/src/styles/$1",
  },
}

// next/jest returns an async function that merges in Next.js' own SWC
// transform + env/config loading.
module.exports = createJestConfig(customJestConfig)
