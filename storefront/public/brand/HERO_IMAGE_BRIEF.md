# Hero image brief — what to make in Canva

Everything needed to produce the homepage hero visual so it drops straight in
and needs no code change. Replaces `hero-wine.jpg`.

---

## 1. Canvas

| | |
|---|---|
| **Size** | **1200 × 1400 px** (portrait) |
| **Why that size** | It renders at ~420 px wide, so this is ~2.8× — sharp on retina without being a heavy file. |
| **Export** | PNG (or JPG if the background is flat). Aim under ~400 KB. |

In Canva: **Create a design → Custom size → 1200 × 1400 px**.

---

## 2. Background — the single most important instruction

**Set the canvas background to exactly `#F3F5F0`.**

That is the page's own colour. If the image background is that exact hex, the
photo has no visible edge — it simply continues the page. This is the entire
reason the reference you sent looks cohesive. Get this one thing right and the
rest is styling.

In Canva: click the canvas → the colour swatch → type `F3F5F0`.

**Do not use pure white `#FFFFFF`.** It is brighter than the page and will read
as a glowing rectangle — this is exactly what went wrong before.

### Better option, if you have Canva Pro

Export as **PNG with a transparent background** instead (Share → Download →
PNG → tick *Transparent background*). Then the image sits on any colour and is
future-proof if the page tint ever changes. If you do this, keep a soft shadow
under the objects or they will look like they're floating.

Either option works. Flat `#F3F5F0` is simpler; transparent is more flexible.

---

## 3. What should be in it — **food *and* drink**

This is the part the current placeholder gets wrong: it is all wine. The
business is two product lines and the hero has to show both, or Food Central
looks like an afterthought.

An arrangement of roughly **four objects**, grouped so they overlap slightly
rather than sitting in a row:

1. **A wine bottle** — tallest object, standing, toward the back-left. Prefer an
   **unbranded / plain-label** bottle. A recognisable brand implies an
   endorsement or distribution deal, which is a real legal exposure.
2. **A poured glass of red wine** — mid-height, beside the bottle.
3. **A plate of Nigerian food** — the hero element for Food Central. Jollof
   rice with grilled chicken reads instantly and is already on the menu. Shoot
   it slightly front-right and lower, so it sits in front of the drinks.
4. **One small accent** — a sprig of herb, a folded linen napkin, or a small
   plant. Adds depth. Keep it subordinate; it should not compete.

**Arrange them on a shallow round platform / podium**, like the reference's
white cylinder. That is what makes a product group read as *composed* rather
than *scattered*.

---

## 4. Colours to use inside the image

| Role | Hex | Notes |
|---|---|---|
| **Background** | `#F3F5F0` | Must match exactly. Non-negotiable. |
| **Podium / platform** | `#EAEBE3` | A half-step darker than the background so the platform is visible without becoming a hard shape. |
| **Podium shadow** | Black at **12–18 % opacity**, heavily blurred | Soft and directly beneath the objects. Grounds them. |
| **Accent — green** | `#1A9902` | Brand green. Fine for a herb sprig or a leaf. Use sparingly. |
| **Accent — gold** | `#CFCA43` | Brand gold. Good as a thin rim on a tray or a napkin ring. Use *rarely* — it is the "ceremonial" colour. |

**Do not put `#EC2D07` (brand red) in the image.** That red is reserved for
buttons. If it appears in the photo, the "Shop Wine & Spirits" button stops
being the most eye-catching thing on the screen and conversions suffer.

The wine's own deep red is fine — that is a product colour, not UI red.

---

## 5. Lighting and finish

- **Soft, diffused light from the upper-left.** No hard flash, no harsh
  specular highlights. Think window light on an overcast day.
- **Soft shadows falling to the lower-right**, consistent across every object —
  mismatched shadow directions are the fastest way an arrangement looks faked.
- **Warm, not clinical.** `BRAND_IDENTITY.md` §16 calls for warm materials —
  wood, linen, ceramic — over cold marble-and-glass luxury clichés.
- **Steam on the food is a bonus** if Canva has it; it signals "freshly cooked",
  which is the whole Food Central promise.

---

## 6. Framing

- Leave roughly **8–10 % clear margin** on the left, right and top. Objects
  touching the edge will look cropped.
- Leave the **bottom ~12 % empty** apart from the shadow, so the composition
  fades out rather than stopping abruptly.
- Keep the tallest object (the bottle) around **75–80 % of the canvas height** —
  filling the full height makes it feel cramped.

---

## 7. When it's done

Save it as **`hero-wine.jpg`** (or `.png`) into `storefront/public/brand/`,
replacing the current file. No code change is needed — the path is a single
constant in the hero component.

**One thing to tell whoever installs it:** if you export a *transparent* PNG, or
a background that is not `#F3F5F0`, the `mix-blend-mode: multiply` and the
brightness/saturate filters currently on the image must be removed, or the
image will look muddy. Those filters exist only to rescue the current
stand-in photo, whose background is grey rather than the page colour. A
purpose-made image should not need them at all.

Record the source and licence in `IMAGE_CREDITS.md` in this folder.
