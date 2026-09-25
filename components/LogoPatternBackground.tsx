import React, { useState } from "react";
import { Image, LayoutChangeEvent, StyleSheet, View } from "react-native";

export const BRAND_LOGO = require("../assets/logo.webp");

// Logo tile size and the gap between tiles (points).
const TILE = 40;
const GAP = 44;
// The layer overhangs its parent on every side so the rotated grid still
// covers the corners; the parent must set overflow: "hidden".
const OVERHANG = 140;

/**
 * Faint diagonal, brick-staggered logo pattern for branded share images
 * (transaction receipt, wallet address card). Render it as the first child of
 * a card with overflow: "hidden" so everything else draws on top.
 */
const LogoPatternBackground = ({ opacity = 0.05 }: { opacity?: number }) => {
  // Start with a generous estimate so the first capture is already covered,
  // then size the grid to the real layer once it's measured.
  const [size, setSize] = useState({ width: 620, height: 1200 });

  const handleLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width !== size.width || height !== size.height) {
      setSize({ width, height });
    }
  };

  const step = TILE + GAP;
  const rows = Math.ceil(size.height / step) + 1;
  const cols = Math.ceil(size.width / step) + 1;

  return (
    <View
      style={[styles.layer, { opacity }]}
      pointerEvents="none"
      onLayout={handleLayout}
    >
      {Array.from({ length: rows }, (_, row) => (
        <View key={row} style={[styles.row, row % 2 === 1 && styles.rowOffset]}>
          {Array.from({ length: cols }, (__, col) => (
            <Image
              key={col}
              source={BRAND_LOGO}
              style={styles.tile}
              fadeDuration={0}
            />
          ))}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  layer: {
    position: "absolute",
    top: -OVERHANG,
    bottom: -OVERHANG,
    left: -OVERHANG,
    right: -OVERHANG,
    transform: [{ rotate: "-24deg" }],
    rowGap: GAP,
    justifyContent: "center",
  },
  row: {
    flexDirection: "row",
    columnGap: GAP,
  },
  // Stagger alternate rows by half a step for a brick-style pattern.
  rowOffset: {
    marginLeft: (TILE + GAP) / 2,
  },
  tile: {
    width: TILE,
    height: TILE,
    borderRadius: 9,
  },
});

export default LogoPatternBackground;
