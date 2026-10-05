import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import * as THREE from "three";

const Aircraft = forwardRef(({ telemetry = {} }, ref) => {
  const aircraftRef = useRef();
  const { scene } = useGLTF("/models/aircraft.glb");

  useEffect(() => {
    const aircraftColor = new THREE.Color("#64748b");

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

        // Avoid repeatedly changing the color during effect reruns.
        if (
          material.color &&
          !material.userData.aircraftColorApplied
        ) {
          material.color.lerp(aircraftColor, 0.35);
          material.userData.aircraftColorApplied = true;
        }
      });
    });
  }, [scene]);

  useImperativeHandle(ref, () => aircraftRef.current);

  useFrame((_, delta) => {
    if (!aircraftRef.current) return;

    const aircraft = aircraftRef.current;

    const numeric = (value) => {
      const result = Number(value);
      return Number.isFinite(result) ? result : 0;
    };

    const speed = Math.max(0, numeric(telemetry.speed));

    const pitchDegrees = THREE.MathUtils.clamp(
      numeric(telemetry.pitch),
      -30,
      30
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
    const distance = (speed / 25) * frameDelta;

    aircraft.position.x -=
      Math.sin(aircraft.rotation.y) * distance;

    aircraft.position.z -=
      Math.cos(aircraft.rotation.y) * distance;

    // Ignore small pitch fluctuations around level.
    const climbPitch =
      Math.abs(pitchDegrees) < 1 ? 0 : pitchDegrees;

    // Simple demo takeoff, climb, and descent.
    if (speed > 120 || aircraft.position.y > 1.1) {
      aircraft.position.y +=
        climbPitch * 0.5 * frameDelta;
    }

    // Keep the aircraft above the runway.
    aircraft.position.y = Math.max(
      1.1,
      aircraft.position.y
    );
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