# Trash Blob

Drag-to-delete with a liquid metal hole. Pick up a card: the screen dims, a
chrome blob rises out of the bottom edge and magnetizes the card from afar.
Release it close enough and the card dematerializes into a drop that gets
sucked in with a gulp and a haptic tick.

## How it works

- **Metaballs.** The hole and the absorbed drop are drawn on a Skia canvas
  inside a layer with `Blur` + a `ColorMatrix` that sharpens the blurred
  alpha back into a hard edge. Close shapes merge like liquid.
- **Liquid metal shading.** The hole is filled with an off-center chrome
  `RadialGradient` plus a soft blurred specular highlight on top.
- **Magnet.** The dragged card gets an extra translation toward the hole
  (up to `MAGNET_PULL` pt) and stretches along the pull axis, squashing
  across it. The deformation ramps quadratically with proximity.
- **Dematerialize.** On release near the hole the card fades and shrinks on
  the spot while a metal drop spawns at the release point and accelerates
  into the mouth. The gulp is a radius pulse on the blob.

## Usage

```tsx
import { TrashBlob, type TrashItem } from "./TrashBlob";

<TrashBlob items={items} onDelete={(id) => remove(id)} />
```

## Tuning

- `BLOB_BASE_R` (64) — resting size of the hole.
- `INFLUENCE` (480) — how far the magnet and the mouth react.
- `ABSORB_DIST` (110) — release distance that counts as a delete.
- `MAGNET_PULL` (62) — max pull offset on the card.
- `Blur blur={12}` and `GOO_MATRIX` — thickness and stickiness of the goo.
