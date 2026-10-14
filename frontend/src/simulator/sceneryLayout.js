// Deterministic placement makes the scenery stable across renders and devices.
export function makeVegetation() {
  let seed = 7823;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const trees = [];
  for (let index = 0; index < 300; index++) {
    const x = (random() < .5 ? -1 : 1) * (48 + random() * 540);
    const z = -70 - random() * 600;
    // Keep the airport apron and approach corridor open.
    if (x > 30 && x < 115 && z > -235 && z < -100) continue;
    trees.push({ x, z, height: 4 + random() * 7, width: 1.8 + random() * 2, shade: random() });
  }
  return trees;
}

export function ridgeHeight(angle, layer) {
  const phase = layer * .8;
  return 60 + 75 * Math.abs(Math.sin(angle * 5 + phase))
    + 35 * Math.abs(Math.sin(angle * 11 + 1.3 + phase))
    + 18 * Math.sin(angle * 23 + phase) ** 2;
}
