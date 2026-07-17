import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DotGrid } from "@/components/DotGrid";
import { LAB_ENTRIES } from "@/lab";
import { Pressable, ScrollView, Text, View } from "@/tw";

type Props = {
  onOpen: (slug: string) => void;
};

export default function LabHome({ onOpen }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-neutral-50">
      <DotGrid />
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6"
        contentContainerStyle={{
          paddingTop: insets.top + 48,
          paddingBottom: insets.bottom + 48,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="font-mono text-[11px] uppercase tracking-[0.22em] text-neutral-400">
          / Lab
        </Text>
        <Text className="mt-3 text-3xl font-semibold tracking-tight text-neutral-900">
          My work, open sourced.
        </Text>
        <Text className="mt-2 max-w-[32ch] text-sm leading-relaxed text-neutral-500">
          React Native experiments. One folder per animation, each with its
          own README.
        </Text>

        <View className="mt-10 border-t border-neutral-200">
          {LAB_ENTRIES.map((entry, index) => (
            <Pressable
              key={entry.slug}
              onPress={() => onOpen(entry.slug)}
              className="flex-row items-center gap-4 border-b border-neutral-200 bg-neutral-50/60 py-5 active:bg-neutral-200/60"
            >
              <Text className="font-mono text-[11px] text-neutral-300 tabular-nums">
                {String(index + 1).padStart(2, "0")}
              </Text>
              <View className="flex-1 gap-1">
                <Text className="text-base font-semibold text-neutral-900">
                  {entry.title}
                </Text>
                <Text className="text-xs leading-relaxed text-neutral-500">
                  {entry.description}
                </Text>
                <View className="mt-1.5 flex-row flex-wrap gap-1.5">
                  {entry.stack.map((tech) => (
                    <Text
                      key={tech}
                      className="rounded-full border border-neutral-200 px-2 py-0.5 font-mono text-[10px] text-neutral-400"
                    >
                      {tech}
                    </Text>
                  ))}
                </View>
              </View>
              <Text className="text-lg text-neutral-300">→</Text>
            </Pressable>
          ))}
        </View>

        <Text className="mt-8 font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-300">
          github.com/rs-4/lab
        </Text>
      </ScrollView>
    </View>
  );
}
