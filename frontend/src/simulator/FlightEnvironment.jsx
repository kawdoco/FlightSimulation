import { memo, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { createCloudTexture, createSurfaceTexture } from './environmentTextures';
import MountainRange from './MountainRange';
import AirportScenery from './AirportScenery';
import { QUALITY_PRESETS } from './sceneSettings';

function FlightEnvironment({ quality = 'medium' }) {
  const grass = useMemo(() => createSurfaceTexture('grass'), []);
  const cloud = useMemo(createCloudTexture, []);
  const terrain = useMemo(() => {
    const segments = QUALITY_PRESETS[quality].terrainSegments;
    const geometry = new THREE.PlaneGeometry(2400, 2400, segments, segments);
    const positions = geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const z = -positions.getY(i);
      const distance = Math.hypot(x, z);
      const blend = THREE.MathUtils.smoothstep(distance, 240, 650);
      const ridges = 30 + Math.sin(x / 125) * 18 + Math.cos(z / 150) * 16
        + Math.sin((x + z) / 75) * 9;
      const peaks = 55 * Math.exp(-((x + 420) ** 2 + (z + 680) ** 2) / 100000)
        + 65 * Math.exp(-((x - 430) ** 2 + (z + 820) ** 2) / 120000);
      positions.setZ(i, Math.max(0, ridges + peaks) * blend * .45);
    }
    geometry.computeVertexNormals();
    return geometry;
  }, [quality]);
  useEffect(() => () => { grass.dispose(); cloud.dispose(); }, [grass, cloud]);
  useEffect(() => () => terrain.dispose(), [terrain]);
  return <group>
    <MountainRange />
    <AirportScenery quality={quality} />
    <mesh geometry={terrain} rotation={[-Math.PI / 2, 0, 0]} position={[0, -.12, 0]} receiveShadow>
      <meshStandardMaterial map={grass} roughness={1} />
    </mesh>
    {[
      [-480, 180, -700, 310, 90], [-220, 210, -850, 260, 100],
      [40, 185, -800, 240, 72], [300, 220, -950, 320, 90],
      [600, 170, -780, 240, 70], [-640, 230, -450, 290, 95],
      [-100, 290, -1000, 420, 95], [500, 310, -1100, 460, 85],
      [-350, 320, -1100, 330, 75], [200, 300, -650, 290, 60],
      [500, 210, 120, 250, 90],
    ].map(([x, y, z, width, height], index) => <sprite key={index} position={[x, y, z]} scale={[width, height, 1]}><spriteMaterial map={cloud} transparent opacity={.85} depthWrite={false} fog={false} toneMapped={false} /></sprite>)}
  </group>;
}

export default memo(FlightEnvironment);
