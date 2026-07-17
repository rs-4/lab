import React from "react";
import { useCssElement } from "react-native-css";
import {
  View as RNView,
  Text as RNText,
  Pressable as RNPressable,
  ScrollView as RNScrollView,
} from "react-native";
import RNAnimated from "react-native-reanimated";

export type ViewProps = React.ComponentProps<typeof RNView> & {
  className?: string;
};

export const View = (props: ViewProps) => {
  return useCssElement(RNView, props, { className: "style" });
};
View.displayName = "CSS(View)";

export const Text = (
  props: React.ComponentProps<typeof RNText> & { className?: string }
) => {
  return useCssElement(RNText, props, { className: "style" });
};
Text.displayName = "CSS(Text)";

export const ScrollView = (
  props: React.ComponentProps<typeof RNScrollView> & {
    className?: string;
    contentContainerClassName?: string;
  }
) => {
  return useCssElement(RNScrollView as React.ComponentType<any>, props, {
    className: "style",
    contentContainerClassName: "contentContainerStyle",
  });
};
ScrollView.displayName = "CSS(ScrollView)";

export const Pressable = (
  props: React.ComponentProps<typeof RNPressable> & { className?: string }
) => {
  return useCssElement(RNPressable as React.ComponentType<any>, props, {
    className: "style",
  });
};
Pressable.displayName = "CSS(Pressable)";

export const Animated = {
  ...RNAnimated,
  View: RNAnimated.createAnimatedComponent(View),
  Text: RNAnimated.createAnimatedComponent(Text),
};
