import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function Atmosphere() {
  const sky = useRef();
  useFrame(({ camera }) => { if (sky.current) sky.current.position.copy(camera.position); });
  return <mesh ref={sky} renderOrder={-1}>
    <sphereGeometry args={[1800, 32, 16]} />
    <shaderMaterial side={THREE.BackSide} depthWrite={false} fog={false}
      vertexShader={`varying vec3 skyDirection;
        void main() {
          skyDirection = normalize(position);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`}
      fragmentShader={`varying vec3 skyDirection;
        void main() {
          float height = smoothstep(-0.04, 0.32, normalize(skyDirection).y);
          vec3 horizon = vec3(0.72, 0.82, 0.89);
          vec3 zenith = vec3(0.20, 0.43, 0.72);
          gl_FragColor = vec4(mix(horizon, zenith, height), 1.0);
          #include <colorspace_fragment>
        }`} />
  </mesh>;
}
