import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { makeVegetation } from './sceneryLayout';
import { QUALITY_PRESETS } from './sceneSettings';

function Trees({ quality }) {
  const trunk = useRef();
  const lower = useRef();
  const upper = useRef();
  const bushes = useRef();
  const trees = useMemo(() => makeVegetation().slice(0, QUALITY_PRESETS[quality].treeCount), [quality]);
  useLayoutEffect(() => {
    const object = new THREE.Object3D();
    const color = new THREE.Color();
    trees.forEach((tree, index) => {
      object.position.set(tree.x, tree.height * .22, tree.z);
      object.scale.set(.22, tree.height * .44, .22);
      object.updateMatrix();
      trunk.current.setMatrixAt(index, object.matrix);
      object.position.y = tree.height * .5;
      object.scale.set(tree.width, tree.height * .72, tree.width);
      object.updateMatrix();
      lower.current.setMatrixAt(index, object.matrix);
      object.position.y = tree.height * .76;
      object.scale.set(tree.width * .72, tree.height * .55, tree.width * .72);
      object.updateMatrix();
      upper.current.setMatrixAt(index, object.matrix);
      color.setHSL(.25 + tree.shade * .04, .24, .22 + tree.shade * .1).convertSRGBToLinear();
      lower.current.setColorAt(index, color);
      upper.current.setColorAt(index, color.clone().multiplyScalar(1.08));
      object.position.set(tree.x * .76, .7, tree.z * .78);
      object.scale.set(1.6 + tree.shade, .9 + tree.shade * .5, 1.3 + tree.shade);
      object.updateMatrix();
      bushes.current.setMatrixAt(index, object.matrix);
      bushes.current.setColorAt(index, color.clone().multiplyScalar(1.2));
    });
    for (const ref of [trunk, lower, upper, bushes]) {
      ref.current.instanceMatrix.needsUpdate = true;
      if (ref.current.instanceColor) ref.current.instanceColor.needsUpdate = true;
      ref.current.computeBoundingSphere();
    }
  }, [trees]);
  return <group>
    <instancedMesh ref={trunk} args={[null, null, trees.length]}><cylinderGeometry args={[.65, 1, 1, 5]} /><meshStandardMaterial color="#625b48" /></instancedMesh>
    <instancedMesh ref={lower} args={[null, null, trees.length]}><coneGeometry args={[1, 1, 7]} /><meshStandardMaterial roughness={1} /></instancedMesh>
    <instancedMesh ref={upper} args={[null, null, trees.length]}><coneGeometry args={[1, 1, 7]} /><meshStandardMaterial roughness={1} /></instancedMesh>
    <instancedMesh ref={bushes} args={[null, null, trees.length]}><icosahedronGeometry args={[1, 1]} /><meshStandardMaterial roughness={1} /></instancedMesh>
  </group>;
}

function Hangar({ position, width = 20 }) {
  return <group position={position}>
    <mesh position={[0, .01, 7]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[width + 10, 35]} /><meshStandardMaterial color="#9a9d93" roughness={1} /></mesh>
    <mesh position={[0, 3.5, 0]}><boxGeometry args={[width, 7, 15]} /><meshStandardMaterial color="#c3c7c1" roughness={.85} /></mesh>
    {[-1, 1].map(side => <mesh key={side} position={[side * width / 4, 7.8, 0]} rotation={[0, 0, side * -.16]}><boxGeometry args={[width / 2 + .4, .25, 16]} /><meshStandardMaterial color="#6d7f86" roughness={.75} /></mesh>)}
    <mesh position={[0, 2.8, 7.52]}><planeGeometry args={[width - 3, 5.5]} /><meshStandardMaterial color="#647b85" /></mesh>
    {[-.3, -.1, .1, .3].map(fraction => <mesh key={fraction} position={[fraction * width, 2.8, 7.55]}><boxGeometry args={[.07, 5.4, .04]} /><meshStandardMaterial color="#a3b3b7" /></mesh>)}
  </group>;
}

function Windsock() {
  return <group position={[29, 0, -95]}>
    <mesh position={[0, 3.2, 0]}><cylinderGeometry args={[.065, .09, 6.4, 8]} /><meshStandardMaterial color="#c7cdd0" metalness={.3} roughness={.6} /></mesh>
    <group position={[1.1, 6.2, 0]} rotation={[0, 0, -Math.PI / 2 + .14]}>
      {Array.from({ length: 5 }, (_, index) => <mesh key={index} position={[0, -.8 + index * .4, 0]}><cylinderGeometry args={[.34 - index * .045, .385 - index * .045, .4, 12, 1, true]} /><meshStandardMaterial color={index % 2 ? '#eee6cf' : '#d5764c'} side={THREE.DoubleSide} roughness={1} /></mesh>)}
    </group>
  </group>;
}

export default function AirportScenery({ quality = 'medium' }) {
  return <group><Trees key={quality} quality={quality} /><Hangar position={[64, 0, -145]} /><Hangar position={[91, 0, -170]} width={17} /><Windsock /></group>;
}
