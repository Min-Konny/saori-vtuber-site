export const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

// Keep the total journey fixed as the collection grows.
export function sceneAt(scroll, top, viewportHeight, count) {
  const step = Math.max(1, viewportHeight * 3.25 / Math.max(1, count - 1));
  const position = clamp((scroll - top) / step, 0, Math.max(0, count - 1));
  return { position, active: Math.round(position), step };
}

export function artworkPose(index, position) {
  const distance = index - position;
  return {
    x: distance * 112,
    opacity: clamp(1.8 - Math.abs(distance) * 1.1),
  };
}
