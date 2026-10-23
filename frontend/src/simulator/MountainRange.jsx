import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { ridgeHeight } from './sceneryLayout';

function MountainLayer({ radius, layer, color }) {
  const geometry = useMemo(() => {
    const segments = 128;
    const rows = 7;
    const vertices = [];
    const colors = [];
    const indices = [];
    const base = new THREE.Color(color);
    for (let row = 0; row <= rows; row++) {
      const fraction = row / rows;
      for (let segment = 0; segment <= segments; segment++) {
        const angle = segment / segments * Math.PI * 2;
        const distance = radius + fraction * 330;
        const profile = Math.sin(fraction * Math.PI) ** .9;
        const height = ridgeHeight(angle, layer) * profile * (1 + layer * .22);
        vertices.push(Math.sin(angle) * distance, height - 1, Math.cos(angle) * distance);
        const tint = base.clone().multiplyScalar(.78 + fraction * .22 + .08 * Math.sin(angle * 19));
        colors.push(tint.r, tint.g, tint.b);
        if (row < rows && segment < segments) {
          const first = row * (segments + 1) + segment;
          const next = first + segments + 1;
          indices.push(first, next, first + 1, first + 1, next, next + 1);
        }
      }
    }
    const result = new THREE.BufferGeometry();
    result.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    result.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    result.setIndex(indices);
    result.computeVertexNormals();
    return result;
  }, [radius, layer, color]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return <mesh geometry={geometry}><meshStandardMaterial vertexColors roughness={1} side={THREE.DoubleSide} /></mesh>;
}

export default function MountainRange() {
  return <group>
    <MountainLayer radius={1800} layer={2} color="#8dabbf" />
    <MountainLayer radius={1300} layer={1} color="#6f8d9a" />
    <MountainLayer radius={850} layer={0} color="#657a69" />
  </group>;
}
