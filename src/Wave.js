import React from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { BufferGeometry, Float32BufferAttribute, LineBasicMaterial } from "three";

const ACCENT = "#8B4513";

function Wave({ color = ACCENT, speed = 0.9, amplitude = 3, points = 21, width = 15 }) {
  const geometry = React.useMemo(() => new BufferGeometry(), []);
  const material = React.useMemo(
    () => new LineBasicMaterial({ color, linewidth: 2, transparent: true, opacity: 0.9 }),
    [color]
  );

  const setPoints = (t) => {
    const arr = new Float32Array(points * 3);
    for (let i = 0; i < points; i += 1) {
      arr[i * 3] = (i / (points - 1)) * width - width / 2;
      arr[i * 3 + 1] = Math.sin(t + i * 0.8) * amplitude;
      arr[i * 3 + 2] = 0;
    }
    geometry.setAttribute("position", new Float32BufferAttribute(arr, 3));
    geometry.attributes.position.needsUpdate = true;
  };

  setPoints(0);
  useFrame((state) => setPoints(state.clock.getElapsedTime() * speed));

  return <threeLine geometry={geometry} material={material} />;
}

export default function WaveCanvas() {
  return (
    <Canvas style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none" }}>
      <Wave />
    </Canvas>
  );
}
