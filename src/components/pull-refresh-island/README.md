# Pull Refresh Island

A gooey pull-to-refresh where a black water drop is pulled out of the
iPhone Dynamic Island, detaches, spins while refreshing, then gets absorbed
back in. On devices without a Dynamic Island the drop drips from the top
edge of the screen instead.

## How it works

**Metaballs.** The island and the drop are drawn as plain black shapes on a
Skia `Canvas`, inside a layer that applies a `Blur` followed by a
`ColorMatrix` that sharpens the blurred alpha back into a hard edge:

```
alpha' = alpha * 40 - 18
```

When the two shapes are close, their blurred alphas overlap and survive the
threshold. That overlap is the liquid neck. As the drop travels away the
neck thins and snaps on its own.

**Gesture.** A `Pan` gesture runs simultaneously with the ScrollView's
native gesture and only accumulates when the scroll is at the top, with
progressive resistance. Past the threshold, release holds the drop in
place, runs `onRefresh`, then springs everything back. A white progress
ring fills with the pull, then hands off to a rotating spinner.

**Dynamic Island detection.** Island devices report a top safe-area inset
of 59pt (iPhone 14 Pro to 16) or 62pt (16 Pro), and the island sits 48pt
above the bottom of that inset on all of them:

```ts
const hasIsland = Platform.OS === "ios" && insets.top >= 59;
const islandTop = insets.top - 48;
```

## Usage

```tsx
import { PullRefreshIsland } from "./PullRefreshIsland";

<PullRefreshIsland onRefresh={async () => await reload()}>
  {/* scrollable content */}
</PullRefreshIsland>
```

### Props

| Prop                        | Type                          | Default | Description                                 |
| --------------------------- | ----------------------------- | ------- | ------------------------------------------- |
| `onRefresh`                 | `() => Promise<void> \| void` | —       | Called on release past the threshold.       |
| `threshold`                 | `number`                      | `100`   | Pull distance (pt) that triggers a refresh. |
| `className`                 | `string`                      | —       | Container classes (NativeWind).             |
| `contentContainerClassName` | `string`                      | —       | Classes for the scroll content wrapper.     |

## Tuning the goo

- `Blur blur={6}` — how far the liquid reaches. Higher = thicker goo.
- `GOO_MATRIX` (`40, -18`) — edge sharpness of the thresholded alpha.
- `DROP_RADIUS` — size of the detached drop.
- `holdY` — where the drop rests while refreshing.
