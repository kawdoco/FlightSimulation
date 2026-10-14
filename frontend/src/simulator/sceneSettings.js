export const QUALITY_PRESETS = {
  low: { dpr: 1, shadows: false, shadowSize: 256, terrainSegments: 40, treeCount: 90 },
  medium: { dpr: 1.25, shadows: true, shadowSize: 512, terrainSegments: 72, treeCount: 180 },
  high: { dpr: 1.5, shadows: true, shadowSize: 1024, terrainSegments: 112, treeCount: 300 },
};

export const CAMERA_VIEWS = {
  chase: { label: 'Chase', offset: [0, 3.2, 10], target: [0, 1, -10], fov: 55 },
  side: { label: 'Side', offset: [14, 4, 3], target: [0, 1, 0], fov: 50 },
  top: { label: 'Top', offset: [0, 25, 1], target: [0, 0, -2], fov: 55 },
  forward: { label: 'Forward', offset: [0, 2, -6], target: [0, 2, -80], fov: 65 },
};
