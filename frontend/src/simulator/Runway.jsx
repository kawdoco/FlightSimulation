import { memo, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { createSurfaceTexture } from './environmentTextures';

function combine(parts) {
  const geometry = mergeGeometries(parts);
  parts.forEach(part => part.dispose());
  return geometry;
}

function Runway() {
  const asphalt = useMemo(() => createSurfaceTexture('asphalt'), []);
  const markings = useMemo(() => {
    const parts = [];
    const stripe = (x, z, width, length) => parts.push(new THREE.PlaneGeometry(width, length).rotateX(-Math.PI / 2).translate(x, .058, z));
    for (let index = 0; index < 37; index++) stripe(0, 43 - index * 8, .25, 4);
    for (const x of [-9, 9]) stripe(x, -95, .18, 296);
    for (const x of [-7, -5.5, -4, 4, 5.5, 7]) stripe(x, 12, .65, 8);
    for (const x of [-5, 5]) stripe(x, -30, 1.2, 7);
    return combine(parts);
  }, []);
  const lights = useMemo(() => {
    const parts = [];
    for (let index = 0; index < 30; index++) {
      for (const x of [-10.2, 10.2]) parts.push(new THREE.SphereGeometry(.07, 6, 4).translate(x, .12, 40 - index * 10));
    }
    return combine(parts);
  }, []);
  useEffect(() => () => { asphalt.dispose(); markings.dispose(); lights.dispose(); }, [asphalt, markings, lights]);
  return <group>
    <mesh position={[0, -.03, -95]} receiveShadow><boxGeometry args={[23, .12, 310]} /><meshStandardMaterial color="#96968d" roughness={1} /></mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, .04, -95]} receiveShadow><planeGeometry args={[20, 300]} /><meshStandardMaterial map={asphalt} roughness={.95} /></mesh>
    <mesh geometry={markings}><meshStandardMaterial color="#ecebe1" roughness={1} /></mesh>
    <mesh geometry={lights}><meshStandardMaterial color="#ead7a4" emissive="#af8b3f" emissiveIntensity={.4} /></mesh>
  </group>;
}

export default memo(Runway);
