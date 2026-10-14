import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { createCloudTexture, createSurfaceTexture } from './environmentTextures';

export default function FlightEnvironment() {
  const grass = useMemo(() => createSurfaceTexture('grass'), []);
  const cloud = useMemo(createCloudTexture, []);
  const terrain = useMemo(() => {
    const geometry = new THREE.PlaneGeometry(2400, 2400, 112, 112);
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
  }, []);
  useEffect(() => () => { grass.dispose(); cloud.dispose(); terrain.dispose(); }, [grass, cloud, terrain]);
  return <group>
    <mesh geometry={terrain} rotation={[-Math.PI / 2, 0, 0]} position={[0, -.12, 0]} receiveShadow>
      <meshStandardMaterial map={grass} roughness={1} />
    </mesh>
    {[
      [-360, 130, -650, 220, 80], [-100, 160, -800, 260, 80],
      [280, 140, -700, 240, 72], [480, 180, -920, 260, 90],
      [-600, 190, -450, 290, 100], [500, 210, 120, 250, 90],
    ].map(([x, y, z, width, height], index) => <sprite key={index} position={[x, y, z]} scale={[width, height, 1]}><spriteMaterial map={cloud} transparent opacity={.85} depthWrite={false} fog={false} toneMapped={false} /></sprite>)}
  </group>;
}
