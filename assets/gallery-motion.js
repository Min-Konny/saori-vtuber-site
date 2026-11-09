export const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

// Each new piece is reached in 0.65 viewport heights. No scroll capture or delays.
export function sceneAt(scroll, top, viewportHeight, count) {
  const step = Math.max(1, viewportHeight * 0.65);
  const position = clamp((scroll - top) / step, 0, Math.max(0, count - 1));
  return { position, active: Math.round(position), step };
}

export function artworkPose(index, position) {
  const distance = index - position;
  return {
    x: distance * 112,
    z: -Math.min(1.5, Math.abs(distance)) * 440,
    rotateY: distance * -24,
    rotateZ: distance * 6,
    opacity: clamp(1.8 - Math.abs(distance) * 1.1),
    scale: 1 - Math.min(1, Math.abs(distance)) * 0.15,
  };
}
