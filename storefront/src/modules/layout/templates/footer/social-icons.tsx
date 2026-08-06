/**
 * Brand marks for the footer's social row. Hand-authored because
 * @medusajs/icons ships only Facebook, LinkedIn and X — none of the four
 * platforms this storefront actually uses. Each is a plain 24x24 path
 * inheriting `currentColor`, so they pick up the surrounding link's own
 * colour and hover state like every other icon in the layout.
 */

type SocialIconProps = {
  className?: string
}

const base = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "currentColor",
  "aria-hidden": true,
  focusable: false,
} as const

export function InstagramIcon({ className }: SocialIconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41-.56-.22-.96-.48-1.38-.9-.42-.42-.68-.82-.9-1.38-.16-.42-.36-1.06-.41-2.23-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41 1.27-.06 1.65-.07 4.85-.07M12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63c-.79.3-1.46.71-2.13 1.38C1.34 2.68.93 3.35.63 4.14.33 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.3.79.71 1.46 1.38 2.13.67.67 1.34 1.08 2.13 1.38.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56.79-.3 1.46-.71 2.13-1.38.67-.67 1.08-1.34 1.38-2.13.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91-.3-.79-.71-1.46-1.38-2.13C21.32 1.34 20.65.93 19.86.63 19.1.33 18.22.13 16.95.07 15.67.01 15.26 0 12 0Z" />
      <path d="M12 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32ZM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Z" />
      <circle cx="18.41" cy="5.59" r="1.44" />
    </svg>
  )
}

export function WhatsAppIcon({ className }: SocialIconProps) {
  return (
    <svg {...base} className={className}>
      {/* The previous drawing was the standard mark but built from many
          short, fussy bezier segments (the phone-handset detail inside
          the bubble especially) — at this button's actual rendered size
          those blur into a smudge rather than reading as a phone. This is
          the same silhouette redrawn with fewer, bolder curves: an
          outer speech-bubble-with-tail, and a chunky, simplified handset
          cut from it with `fillRule="evenodd"` so the two stay one flat
          shape (matching Instagram/TikTok/YouTube's solid-mark style
          instead of Simple Icons' finer, stroke-illustration style). */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 1.5C6.2 1.5 1.5 6.2 1.5 12c0 1.94.53 3.76 1.45 5.32L1.5 22.5l5.3-1.39A10.44 10.44 0 0 0 12 22.5c5.8 0 10.5-4.7 10.5-10.5S17.8 1.5 12 1.5Zm0 19.13c-1.72 0-3.32-.5-4.67-1.36l-.33-.2-3.15.83.84-3.07-.22-.32A8.62 8.62 0 0 1 3.38 12c0-4.76 3.87-8.62 8.62-8.62S20.62 7.24 20.62 12 16.76 20.63 12 20.63Z"
      />
      <path d="M9.1 7.4c-.24-.53-.5-.54-.73-.55h-.62c-.22 0-.57.08-.87.4-.3.32-1.13 1.1-1.13 2.68 0 1.58 1.16 3.1 1.32 3.32.16.21 2.24 3.58 5.53 4.87 2.73 1.08 3.29.86 3.88.81.6-.06 1.93-.79 2.2-1.55.27-.76.27-1.42.19-1.55-.08-.14-.3-.22-.62-.38-.32-.16-1.93-.95-2.23-1.06-.3-.11-.51-.16-.73.16-.22.32-.85 1.06-1.04 1.28-.19.22-.38.24-.7.08-.32-.16-1.36-.5-2.6-1.6-.96-.86-1.6-1.91-1.79-2.23-.19-.32-.02-.5.14-.66.14-.14.32-.38.48-.57.16-.19.21-.32.32-.54.11-.21.05-.4-.03-.56-.08-.16-.7-1.78-.99-2.4Z" />
    </svg>
  )
}

export function TikTokIcon({ className }: SocialIconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 3.79-4.25V9.66a6.34 6.34 0 0 0-1.06-.09A6.34 6.34 0 1 0 16.24 16V9.02a8.16 8.16 0 0 0 4.77 1.52V7.09c-.42 0-.84-.05-1.25-.14a4.87 4.87 0 0 1-.17-.26Z" />
    </svg>
  )
}

export function YouTubeIcon({ className }: SocialIconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.5A3.02 3.02 0 0 0 .5 6.19C0 8.08 0 12 0 12s0 3.92.5 5.81a3.02 3.02 0 0 0 2.12 2.14c1.88.5 9.38.5 9.38.5s7.5 0 9.38-.5a3.02 3.02 0 0 0 2.12-2.14C24 15.92 24 12 24 12s0-3.92-.5-5.81ZM9.55 15.57V8.43L15.82 12l-6.27 3.57Z" />
    </svg>
  )
}
