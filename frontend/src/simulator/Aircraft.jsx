import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import * as THREE from "three";
import { FEET_PER_WORLD_UNIT, forwardDistance } from "./speedDynamics";

const Aircraft = forwardRef(({ telemetry = {} }, ref) => {
  const aircraftRef = useRef();
  const { scene } = useGLTF("/models/aircraft.glb");

  useEffect(() => {
    scene.traverse((object) => {
      if (!object.isMesh) return;

      object.castShadow = true;
      object.receiveShadow = true;

      const materials = Array.isArray(object.material)
        ? object.material
        : [object.material];

      materials.forEach((material) => {
        if (!material) return;

        material.transparent = false;
        material.opacity = 1;
        material.depthWrite = true;

        if ('transmission' in material) material.transmission = 0;
        if (material.name.startsWith('11803_Airplane')) {
          const body = material.name.includes('body');
          const details = material.name.includes('details');
          material.color.set(body ? '#d4dbe2' : details ? '#8998a5' : '#bac5d0');
          material.metalness = body ? .16 : .28;
          material.roughness = details ? .52 : .38;
          if ('clearcoat' in material) material.clearcoat = .1;
        }
        material.needsUpdate = true;
      });
    });
  }, [scene]);

  useImperativeHandle(ref, () => aircraftRef.current);

  useFrame(({ invalidate }, delta) => {
    if (!aircraftRef.current) return;

    const aircraft = aircraftRef.current;

    const numeric = (value) => {
      const result = Number(value);
      return Number.isFinite(result) ? result : 0;
    };

    const speed = Math.max(0, numeric(telemetry.speed));

    const pitchDegrees = THREE.MathUtils.clamp(
      numeric(telemetry.pitch),
      -45,
      45
    );

    const rollDegrees = THREE.MathUtils.clamp(
      numeric(telemetry.roll),
      -45,
      45
    );

    const targetPitch = THREE.MathUtils.degToRad(
      pitchDegrees
    );

    const targetRoll = THREE.MathUtils.degToRad(
      -rollDegrees
    );

    const targetHeading = THREE.MathUtils.degToRad(
      -numeric(telemetry.heading)
    );

    // Limit movement jumps after switching browser tabs.
    const frameDelta = Math.min(delta, 0.1);

    // Smooth rotation consistently across different frame rates.
    const smoothing = 1 - Math.exp(-10 * frameDelta);

    aircraft.rotation.x = THREE.MathUtils.lerp(
      aircraft.rotation.x,
      targetPitch,
      smoothing
    );

    aircraft.rotation.z = THREE.MathUtils.lerp(
      aircraft.rotation.z,
      targetRoll,
      smoothing
    );

    // Use the shortest turn when heading crosses 0° / 360°.
    const headingDifference = Math.atan2(
      Math.sin(targetHeading - aircraft.rotation.y),
      Math.cos(targetHeading - aircraft.rotation.y)
    );

    aircraft.rotation.y += headingDifference * smoothing;

    // Forward movement follows speed and heading.
    const distance = forwardDistance(speed, frameDelta);

    aircraft.position.x -=
      Math.sin(aircraft.rotation.y) * distance;

    aircraft.position.z -=
      Math.cos(aircraft.rotation.y) * distance;

    // Telemetry is the source of truth in keyboard and IoT modes.
    const targetAltitude = 1.1 + Math.max(0, numeric(telemetry.altitude)) / FEET_PER_WORLD_UNIT;
    aircraft.position.y = THREE.MathUtils.lerp(aircraft.position.y, targetAltitude, smoothing);

    // Keep animating during movement; let the renderer sleep when the scene settles.
    if (speed === 0 && (Math.abs(aircraft.rotation.x - targetPitch) > .001
      || Math.abs(aircraft.rotation.z - targetRoll) > .001
      || Math.abs(headingDifference) > .001 || Math.abs(aircraft.position.y - targetAltitude) > .001)) {
      invalidate();
    }
  });

  return (
    <group ref={aircraftRef} position={[0, 1.1, 0]}>
      <primitive
        object={scene}
        scale={0.003}
        rotation={[-Math.PI / 2, 0, Math.PI / 2]}
      />
    </group>
  );
});

Aircraft.displayName = "Aircraft";

useGLTF.preload("/models/aircraft.glb");

export default Aircraft;
