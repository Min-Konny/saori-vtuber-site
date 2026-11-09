export const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

// Each new piece is reached in 0.65 viewport heights. No scroll capture or delays.
export function sceneAt(scroll, top, viewportHeight, count) {
  const step = Math.max(1, viewportHeight * 0.65);
  const position = clamp((scroll - top) / step, 0, Math.max(0, count - 1));
  return { position, active: Math.round(position), step };
}

export function artworkPose(index, position) {
  const distance = index - position;
  const angle = clamp(distance, -1.2, 1.2) * Math.PI / 2;
  return {
    x: Math.sin(angle) * 65,
    y: (1 - Math.cos(angle)) * 20,
    rotation: clamp(distance, -1.5, 1.5) * 90,
    opacity: clamp(1.8 - Math.abs(distance) * 1.1),
  };
}
