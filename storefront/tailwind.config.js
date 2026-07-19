const path = require("path")

module.exports = {
  darkMode: "class",
  presets: [require("@medusajs/ui-preset")],
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/modules/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      transitionProperty: {
        width: "width margin",
        height: "height",
        bg: "background-color",
        display: "display opacity",
        visibility: "visibility",
        padding: "padding-top padding-right padding-bottom padding-left",
      },
      colors: {
        // Vendored Medusa UI preset grayscale — untouched, still used by
        // @medusajs/ui components and the DTC Starter's own vendored pages.
        grey: {
          0: "#FFFFFF",
          5: "#F9FAFB",
          10: "#F3F4F6",
          20: "#E5E7EB",
          30: "#D1D5DB",
          40: "#9CA3AF",
          50: "#6B7280",
          60: "#4B5563",
          70: "#374151",
          80: "#1F2937",
          90: "#111827",
        },
        // LiquorCentral Design System (DESIGN_SYSTEM.md §B6) — Tier 3
        // semantic tokens only. Every value resolves through a CSS custom
        // property (see src/styles/globals.css :root) so a future theme
        // (dark mode, seasonal, accessibility) only ever changes the
        // variable definitions, never these class names or any component.
        // New LiquorCentral components must reference only these tokens —
        // never a raw hex, and never the `grey` scale above.
        primary: {
          DEFAULT: "var(--color-primary)",
          hover: "var(--color-primary-hover)",
          active: "var(--color-primary-active)",
        },
        secondary: {
          DEFAULT: "var(--color-secondary)",
          hover: "var(--color-secondary-hover)",
          active: "var(--color-secondary-active)",
        },
        accent: "var(--color-accent)",
        surface: {
          DEFAULT: "var(--color-surface)",
          elevated: "var(--color-surface-elevated)",
        },
        background: "var(--color-background)",
        "text-primary": "var(--color-text-primary)",
        "text-secondary": "var(--color-text-secondary)",
        "text-muted": "var(--color-text-muted)",
        border: "var(--color-border)",
        divider: "var(--color-divider)",
        focus: "var(--color-focus)",
        interactive: {
          DEFAULT: "var(--color-interactive)",
          hover: "var(--color-interactive-hover)",
          active: "var(--color-interactive-active)",
        },
        disabled: {
          DEFAULT: "var(--color-disabled-text)",
          surface: "var(--color-disabled-surface)",
        },
        success: {
          DEFAULT: "var(--color-success)",
          tint: "var(--color-success-tint)",
        },
        warning: {
          DEFAULT: "var(--color-warning)",
          tint: "var(--color-warning-tint)",
        },
        danger: {
          DEFAULT: "var(--color-danger)",
          tint: "var(--color-danger-tint)",
        },
        information: {
          DEFAULT: "var(--color-information)",
          tint: "var(--color-information-tint)",
        },
        overlay: "var(--color-overlay)",
        // Neutral System (DESIGN_SYSTEM.md §B6) — the raw scale the
        // semantic tokens above resolve from. Prefer the semantic tokens;
        // these exist for the rare case a component genuinely needs a
        // specific neutral step no semantic token names.
        ink: {
          900: "var(--ink-900)",
          700: "var(--ink-700)",
          500: "var(--ink-500)",
          300: "var(--ink-300)",
          200: "var(--ink-200)",
          100: "var(--ink-100)",
        },
      },
      borderRadius: {
        // Vendored Medusa UI preset scale — untouched.
        none: "0px",
        soft: "2px",
        base: "4px",
        rounded: "8px",
        large: "16px",
        circle: "9999px",
        // LiquorCentral Design System (DESIGN_SYSTEM.md §B5).
        "radius-sm": "4px",
        "radius-md": "8px",
        "radius-lg": "16px",
        "radius-full": "9999px",
      },
      boxShadow: {
        // LiquorCentral Design System elevation scale (DESIGN_SYSTEM.md §B4).
        "elevation-0": "none",
        "elevation-1":
          "0 1px 2px rgba(20,15,10,0.06), 0 2px 6px rgba(20,15,10,0.04)",
        "elevation-2":
          "0 4px 12px rgba(20,15,10,0.10), 0 12px 32px rgba(20,15,10,0.08)",
        "elevation-3":
          "0 8px 24px rgba(20,15,10,0.14), 0 24px 64px rgba(20,15,10,0.12)",
      },
      maxWidth: {
        "8xl": "100rem",
        // LiquorCentral Design System max content width (DESIGN_SYSTEM.md §B3).
        "content": "1280px",
      },
      screens: {
        // Vendored Medusa UI preset breakpoints — untouched (extend.screens
        // adds to, not replaces, Tailwind's own sm/md/lg/xl/2xl defaults).
        "2xsmall": "320px",
        xsmall: "512px",
        small: "1024px",
        medium: "1280px",
        large: "1440px",
        xlarge: "1680px",
        "2xlarge": "1920px",
        // LiquorCentral Design System breakpoints (DESIGN_SYSTEM.md §B7).
        // Only `sm` needs overriding — Tailwind's own defaults for
        // md/lg/xl/2xl (768/1024/1280/1536) already match §B7 exactly.
        sm: "480px",
      },
      fontSize: {
        "3xl": "2rem",
        // LiquorCentral Design System typography scale (DESIGN_SYSTEM.md
        // §B1) — a 7-step scale, ~1.25 ratio, 16px base. Weight is applied
        // separately (regular/medium/bold per §B1), not baked into these
        // tokens.
        caption: ["13px", { lineHeight: "1.5" }],
        body: ["16px", { lineHeight: "1.6" }],
        "body-lg": ["18px", { lineHeight: "1.6" }],
        "heading-4": ["20px", { lineHeight: "1.3" }],
        "heading-3": ["25px", { lineHeight: "1.25" }],
        "heading-2": ["31px", { lineHeight: "1.2" }],
        "heading-1": ["39px", { lineHeight: "1.15" }],
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Ubuntu",
          "sans-serif",
        ],
        // LiquorCentral Design System display face (DESIGN_SYSTEM.md §B1 /
        // BRAND_IDENTITY.md §14): "a warm serif/slab display face, used
        // sparingly" — direction only, no specific typeface is selected
        // yet (BRAND_GUIDELINES.md explicitly reserves that decision). A
        // generic system-serif stack satisfies the direction without
        // inventing a brand typeface choice; swap this one array for a
        // real webfont when BRAND_GUIDELINES.md selects one — no component
        // using `font-display` needs to change.
        display: [
          "ui-serif",
          "Georgia",
          "Cambria",
          '"Times New Roman"',
          "Times",
          "serif",
        ],
      },
      transitionDuration: {
        // LiquorCentral Design System motion timing (DESIGN_SYSTEM.md §B10).
        // Pair with Tailwind's own ease-out/ease-in-out/ease-in utilities,
        // which already match §B10's named easings exactly.
        micro: "125ms",
        standard: "225ms",
        entrance: "325ms",
        exit: "225ms",
      },
      keyframes: {
        ring: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "fade-in-right": {
          "0%": {
            opacity: "0",
            transform: "translateX(10px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateX(0)",
          },
        },
        "fade-in-top": {
          "0%": {
            opacity: "0",
            transform: "translateY(-10px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        "fade-out-top": {
          "0%": {
            height: "100%",
          },
          "99%": {
            height: "0",
          },
          "100%": {
            visibility: "hidden",
          },
        },
        "accordion-slide-up": {
          "0%": {
            height: "var(--radix-accordion-content-height)",
            opacity: "1",
          },
          "100%": {
            height: "0",
            opacity: "0",
          },
        },
        "accordion-slide-down": {
          "0%": {
            "min-height": "0",
            "max-height": "0",
            opacity: "0",
          },
          "100%": {
            "min-height": "var(--radix-accordion-content-height)",
            "max-height": "none",
            opacity: "1",
          },
        },
        enter: {
          "0%": { transform: "scale(0.9)", opacity: 0 },
          "100%": { transform: "scale(1)", opacity: 1 },
        },
        leave: {
          "0%": { transform: "scale(1)", opacity: 1 },
          "100%": { transform: "scale(0.9)", opacity: 0 },
        },
        "slide-in": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(0)" },
        },
      },
      animation: {
        ring: "ring 2.2s cubic-bezier(0.5, 0, 0.5, 1) infinite",
        "fade-in-right":
          "fade-in-right 0.3s cubic-bezier(0.5, 0, 0.5, 1) forwards",
        "fade-in-top": "fade-in-top 0.2s cubic-bezier(0.5, 0, 0.5, 1) forwards",
        "fade-out-top":
          "fade-out-top 0.2s cubic-bezier(0.5, 0, 0.5, 1) forwards",
        "accordion-open":
          "accordion-slide-down 300ms cubic-bezier(0.87, 0, 0.13, 1) forwards",
        "accordion-close":
          "accordion-slide-up 300ms cubic-bezier(0.87, 0, 0.13, 1) forwards",
        enter: "enter 200ms ease-out",
        "slide-in": "slide-in 1.2s cubic-bezier(.41,.73,.51,1.02)",
        leave: "leave 150ms ease-in forwards",
      },
    },
  },
  plugins: [require("tailwindcss-radix")()],
}
