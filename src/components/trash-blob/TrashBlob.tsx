import {
  Blur,
  Canvas,
  Circle,
  ColorMatrix,
  Group,
  Paint,
  RadialGradient,
  vec,
} from "@shopify/react-native-skia";
import * as Haptics from "expo-haptics";
import React from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  runOnJS,
  type SharedValue,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Text, View } from "@/tw";

const BLOB_BASE_R = 64;
const INFLUENCE = 480;
const ABSORB_DIST = 110;
const MAGNET_PULL = 62;

// Sharpens the blurred alpha back into a hard edge — the metaball trick
const GOO_MATRIX = [
  1, 0, 0, 0, 0,
  0, 1, 0, 0, 0,
  0, 0, 1, 0, 0,
  0, 0, 0, 40, -18,
];

export type TrashItem = { id: string; color: string; label: string };

type Props = {
  items: TrashItem[];
  onDelete: (id: string) => void;
};

function gulpHaptic() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
}

type DraggableProps = {
  item: TrashItem;
  blobX: number;
  blobY: number;
  dragX: SharedValue<number>;
  dragY: SharedValue<number>;
  dragging: SharedValue<number>;
  gulp: SharedValue<number>;
  visible: SharedValue<number>;
  activeId: SharedValue<string>;
  dropCx: SharedValue<number>;
  dropCy: SharedValue<number>;
  dropR: SharedValue<number>;
  onDelete: (id: string) => void;
};

function DraggableItem({
  item,
  blobX,
  blobY,
  dragX,
  dragY,
  dragging,
  gulp,
  visible,
  activeId,
  dropCx,
  dropCy,
  dropR,
  onDelete,
}: DraggableProps) {
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const scale = useSharedValue(1);
  const cardOp = useSharedValue(1);

  const pan = Gesture.Pan()
    .onStart((e) => {
      dragging.value = 1;
      activeId.value = item.id;
      dragX.value = e.absoluteX;
      dragY.value = e.absoluteY;
      visible.value = withTiming(1, { duration: 160 });
      scale.value = withSpring(1.08);
    })
    .onChange((e) => {
      tx.value += e.changeX;
      ty.value += e.changeY;
      dragX.value = e.absoluteX;
      dragY.value = e.absoluteY;
    })
    .onEnd((e) => {
      dragging.value = 0;
      activeId.value = "";
      const dx = e.absoluteX - blobX;
      const dy = e.absoluteY - blobY;
      if (Math.sqrt(dx * dx + dy * dy) < ABSORB_DIST + 30) {
        // the card dematerializes on the spot: melts into a soft drop
        scale.value = withTiming(0.3, { duration: 180 });
        cardOp.value = withTiming(0, { duration: 160 }, (finished) => {
          if (finished) runOnJS(onDelete)(item.id);
        });
        // the liquid drop takes over and gets sucked into the hole
        dropCx.value = e.absoluteX;
        dropCy.value = e.absoluteY;
        dropR.value = 32;
        dropCx.value = withTiming(blobX, {
          duration: 280,
          easing: Easing.in(Easing.quad),
        });
        dropCy.value = withTiming(blobY, {
          duration: 280,
          easing: Easing.in(Easing.quad),
        });
        dropR.value = withDelay(280, withTiming(0, { duration: 150 }));
        gulp.value = withDelay(
          220,
          withSequence(
            withTiming(1.18, { duration: 150 }),
            withSpring(1, { damping: 16, stiffness: 220 })
          )
        );
        // the blob melts away once the gulp is done
        visible.value = withDelay(800, withTiming(0, { duration: 320 }));
        runOnJS(gulpHaptic)();
      } else {
        scale.value = withSpring(1);
        tx.value = withSpring(0, { damping: 16, stiffness: 180 });
        ty.value = withSpring(0, { damping: 16, stiffness: 180 });
        visible.value = withTiming(0, { duration: 240 });
      }
    });

  const dimT = useDerivedValue(() =>
    withTiming(activeId.value !== "" && activeId.value !== item.id ? 0.25 : 1, {
      duration: 180,
    })
  );

  const style = useAnimatedStyle(() => {
    const isActive = activeId.value === item.id;
    // liquid metal magnet: the card itself gets grabbed, pulled and
    // stretched toward the hole
    let pullX = 0;
    let pullY = 0;
    let angle = 0;
    let stretch = 0;
    if (isActive && dragging.value === 1) {
      const dx = blobX - dragX.value;
      const dy = blobY - dragY.value;
      const len = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
      const t = interpolate(
        len,
        [ABSORB_DIST * 0.4, INFLUENCE],
        [1, 0],
        Extrapolation.CLAMP
      );
      pullX = (dx / len) * MAGNET_PULL * t;
      pullY = (dy / len) * MAGNET_PULL * t;
      angle = Math.atan2(dy, dx);
      stretch = t * t;
    }
    return {
      opacity: cardOp.value * dimT.value,
      transform: [
        { translateX: tx.value + pullX },
        { translateY: ty.value + pullY },
        // stretch along the axis toward the hole, squash across it
        { rotate: `${angle}rad` },
        { scaleX: scale.value * (1 + 0.45 * stretch) },
        { scaleY: scale.value * (1 - 0.3 * stretch) },
        { rotate: `${-angle}rad` },
      ],
      zIndex: isActive ? 10 : 0,
    };
  });

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={style}>
        <View
          className={`h-20 w-20 items-center justify-center rounded-2xl ${item.color} shadow-sm`}
        >
          <Text className="text-xs font-semibold text-white">{item.label}</Text>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

export function TrashBlob({ items, onDelete }: Props) {
  const { width, height } = useWindowDimensions();
  const blobX = width / 2;
  const blobY = height + 14;

  const dragX = useSharedValue(0);
  const dragY = useSharedValue(0);
  const dragging = useSharedValue(0);
  const gulp = useSharedValue(1);
  const visible = useSharedValue(0);
  const activeId = useSharedValue("");
  const dropCx = useSharedValue(0);
  const dropCy = useSharedValue(0);
  const dropR = useSharedValue(0);

  const dist = useDerivedValue(() => {
    const dx = dragX.value - blobX;
    const dy = dragY.value - blobY;
    return Math.sqrt(dx * dx + dy * dy);
  });

  // Mouth opens while dragging, wider as the item gets close
  const openR = useDerivedValue(() => {
    const proximity = interpolate(
      dist.value,
      [ABSORB_DIST, INFLUENCE],
      [28, 0],
      Extrapolation.CLAMP
    );
    return withSpring(
      BLOB_BASE_R + (dragging.value === 1 ? 14 + proximity : 0),
      { damping: 20, stiffness: 210 }
    );
  });

  // hidden at rest: only grows out of the edge while an item is selected
  const blobR = useDerivedValue(() => openR.value * gulp.value * visible.value);

  // The hole leans toward the dragged item, nothing detaches from it
  const leanT = useDerivedValue(() =>
    dragging.value === 1
      ? interpolate(dist.value, [ABSORB_DIST, INFLUENCE], [1, 0], Extrapolation.CLAMP)
      : 0
  );

  const blobCx = useDerivedValue(() => {
    const len = Math.max(dist.value, 1);
    return blobX + ((dragX.value - blobX) / len) * leanT.value * 30;
  });

  const blobCy = useDerivedValue(() => {
    const len = Math.max(dist.value, 1);
    return blobY + ((dragY.value - blobY) / len) * leanT.value * 30;
  });

  // Liquid metal shading: off-center chrome gradient + soft specular
  const shineC = useDerivedValue(() =>
    vec(
      blobCx.value - blobR.value * 0.4,
      blobCy.value - blobR.value * 0.65
    )
  );
  const shadeR = useDerivedValue(() => Math.max(blobR.value * 1.9, 1));
  const specR = useDerivedValue(() => blobR.value * 0.4);
  const specOpacity = useDerivedValue(() => visible.value * 0.5);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: withTiming(dragging.value === 1 ? 1 : 0, { duration: 200 }),
  }));

  return (
    <View className="flex-1">
      {/* dims everything but the dragged item */}
      <Animated.View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: "rgba(23, 23, 23, 0.30)", zIndex: 1 },
          overlayStyle,
        ]}
      />
      <View className="flex-1 flex-row flex-wrap items-start justify-center gap-5 px-6 pt-40" style={{ zIndex: 2 }}>
        {items.map((item) => (
          <DraggableItem
            key={item.id}
            item={item}
            blobX={blobX}
            blobY={blobY}
            dragX={dragX}
            dragY={dragY}
            dragging={dragging}
            gulp={gulp}
            visible={visible}
            activeId={activeId}
            dropCx={dropCx}
            dropCy={dropCy}
            dropR={dropR}
            onDelete={onDelete}
          />
        ))}
      </View>

      <Canvas pointerEvents="none" style={StyleSheet.absoluteFill}>
        <Group
          layer={
            <Paint>
              <Blur blur={12} />
              <ColorMatrix matrix={GOO_MATRIX} />
            </Paint>
          }
        >
          <Circle cx={dropCx} cy={dropCy} r={dropR} color="#2b2e33" />
          <Circle cx={blobCx} cy={blobCy} r={blobR}>
            <RadialGradient
              c={shineC}
              r={shadeR}
              colors={["#eef0f2", "#9fa4ab", "#3c4046", "#08090a"]}
              positions={[0, 0.3, 0.68, 1]}
            />
          </Circle>
        </Group>

        {/* soft specular highlight on top of the goo */}
        <Circle c={shineC} r={specR} color="white" opacity={specOpacity}>
          <Blur blur={10} />
        </Circle>
      </Canvas>
    </View>
  );
}
