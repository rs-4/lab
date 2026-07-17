import React, { useCallback, useState } from "react";
import { Pressable, Text, View } from "@/tw";
import { TrashBlob, type TrashItem } from "./TrashBlob";

const COLORS = [
  "bg-rose-400",
  "bg-orange-400",
  "bg-amber-400",
  "bg-emerald-400",
  "bg-sky-400",
  "bg-violet-400",
];

function makeItems(): TrashItem[] {
  return COLORS.map((color, i) => ({
    id: `item-${i}`,
    color,
    label: `IMG_00${i + 1}`,
  }));
}

export default function TrashBlobDemo() {
  const [items, setItems] = useState<TrashItem[]>(makeItems);

  const handleDelete = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  return (
    <View className="flex-1 bg-neutral-100">
      <View className="absolute inset-x-0 top-24 items-center gap-1">
        <Text className="text-sm text-neutral-400">
          drag a card into the blob
        </Text>
        {items.length === 0 && (
          <Pressable
            onPress={() => setItems(makeItems())}
            className="mt-2 rounded-full bg-neutral-900 px-4 py-2"
          >
            <Text className="text-xs font-medium text-white">reset</Text>
          </Pressable>
        )}
      </View>
      <TrashBlob items={items} onDelete={handleDelete} />
    </View>
  );
}
