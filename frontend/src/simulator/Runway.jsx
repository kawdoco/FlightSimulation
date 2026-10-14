import { useEffect, useMemo } from 'react';
import { createSurfaceTexture } from './environmentTextures';

export default function Runway() {
  const asphalt = useMemo(() => createSurfaceTexture('asphalt'), []);
  useEffect(() => () => asphalt.dispose(), [asphalt]);
  return <group>
    <mesh position={[0, -.03, -95]} receiveShadow><boxGeometry args={[23, .12, 310]} /><meshStandardMaterial color="#96968d" roughness={1} /></mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, .04, -95]} receiveShadow><planeGeometry args={[20, 300]} /><meshStandardMaterial map={asphalt} roughness={.95} /></mesh>
    {Array.from({ length: 37 }, (_, index) => <mesh key={index} rotation={[-Math.PI / 2, 0, 0]} position={[0, .055, 43 - index * 8]}><planeGeometry args={[.25, 4]} /><meshStandardMaterial color="#ecebe1" roughness={1} /></mesh>)}
    {[-9, 9].map(x => <mesh key={x} rotation={[-Math.PI / 2, 0, 0]} position={[x, .055, -95]}><planeGeometry args={[.18, 296]} /><meshStandardMaterial color="#ecebe1" roughness={1} /></mesh>)}
    {[-7, -5.5, -4, 4, 5.5, 7].map(x => <mesh key={x} rotation={[-Math.PI / 2, 0, 0]} position={[x, .058, 12]}><planeGeometry args={[.65, 8]} /><meshStandardMaterial color="#ecebe1" roughness={1} /></mesh>)}
    {[-5, 5].map(x => <mesh key={x} rotation={[-Math.PI / 2, 0, 0]} position={[x, .058, -30]}><planeGeometry args={[1.2, 7]} /><meshStandardMaterial color="#ecebe1" roughness={1} /></mesh>)}
  </group>;
}
