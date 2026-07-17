import type { ComponentType } from "react";
import PullRefreshIslandDemo from "./components/pull-refresh-island/Demo";

export type LabEntry = {
  slug: string;
  title: string;
  description: string;
  stack: string[];
  Demo: ComponentType;
};

export const LAB_ENTRIES: LabEntry[] = [
  {
    slug: "pull-refresh-island",
    title: "Pull Refresh Island",
    description:
      "A gooey pull-to-refresh where a water drop is pulled out of the Dynamic Island.",
    stack: ["Reanimated", "Skia", "Gesture Handler"],
    Demo: PullRefreshIslandDemo,
  },
];
