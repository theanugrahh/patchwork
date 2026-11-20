import React from "react";
import { Canvas } from "@react-three/fiber";
import { StyleSheet, View } from "react-native";

const ACCENT = "#8B4513";
const NEUTRAL = "#C9C4BA";

function Day({ x, count }) {
  const height = Math.min(Math.max(count, 0.6), 3.2);
  return (
    <mesh position={[x, height / 2, 0]} scale={[1.2, height, 1.2]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color={count > 0 ? ACCENT : NEUTRAL} transparent opacity={0.85} />
    </mesh>
  );
}

const styles = StyleSheet.create({
  wrapper: { height: 64 },
  canvas: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
});

export default function WeekWave({ entries }) {
  const counts = {};
  for (const e of entries || []) {
    counts[e.date] = (counts[e.date] || 0) + 1;
  }
  const days = [];
  for (let i = 6; i >= 0; i -= 1) {
    days.push(new Date(Date.now() - i * 86400000).toISOString().slice(0, 10));
  }
  return (
    <View style={styles.wrapper}>
      <Canvas style={styles.canvas}>
        {days.map((d, i) => (
          <Day key={d} x={(i / (days.length - 1)) * 14 - 7} count={counts[d] || 0} />
        ))}
      </Canvas>
    </View>
  );
}
