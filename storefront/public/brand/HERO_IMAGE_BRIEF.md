# Hero image brief — what to make in Canva

Everything needed to produce the homepage hero visual so it drops straight in
and needs no code change. Produces `hero-food-drink.jpg`.

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

### Do not ask for a transparent background

This was tried and it failed — see the Lessons section at the end. A real
alpha channel from Canva's own export is fine, but **an AI generator asked for
transparency will draw a picture of a checkerboard instead**, which is
unusable. A solid, flat background is the reliable route.

It also does not need to be exactly `#F3F5F0`. Flat and uniform matters far
more than exact: any even background can be mapped onto the page colour in
code, which is what the current image went through.

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

Hand the raw file over — it needs a short processing pass before it ships
(background normalised onto `#F3F5F0`, any decorative sparkle painted out,
outer edge feathered so no shadow can terminate in a straight line). The
current image went through exactly that; `IMAGE_CREDITS.md` records the
numbers used.

Once processed it is saved as **`hero-food-drink.jpg`** in
`storefront/public/brand/`. No code change is needed — the path is a single
constant in the hero component.

**The component carries no `mix-blend-mode`, no filter and no mask, and it
should stay that way.** Those were only ever needed to rescue an image whose
background did not match the page. Fix the background instead.

Record the source and licence in `IMAGE_CREDITS.md` in this folder.

---

## Lessons from the three attempts that produced the current image

Read this before re-generating.

1. **Never ask for a transparent background.** Attempt 2 came back as RGB with
   no alpha channel — the generator had *drawn* a grey-and-white checkerboard
   instead. That pattern is baked into the pixels, so where it sits behind the
   glass, the steam or the shadow it is blended into them and cannot be cleanly
   removed. Ask for a **solid** background and let it be normalised in code.
2. **State the margin and shadow rules explicitly.** Attempt 1's contact shadow
   ran off the left edge and ended in a straight line, which no CSS can repair.
   The brief now requires every object *and its shadow* to sit fully inside the
   frame.
3. **Expect a decorative sparkle** in a corner and plan to paint it out.
4. **A slightly-off flat background is fine.** The delivered image was
   `#EDEEE6`, not `#F3F5F0`, and a per-channel gain mapped it exactly onto the
   page colour. Flat and uniform matters far more than exact.
