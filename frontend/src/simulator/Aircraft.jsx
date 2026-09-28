import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import * as THREE from "three";

const Aircraft = forwardRef(({ telemetry }, ref) => {
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
        material.transparent = false;
        material.opacity = 1;
        material.depthWrite = true;
        material.color?.lerp(new THREE.Color("#64748b"), 0.35);
      });
    });
  }, [scene]);

  useImperativeHandle(ref, () => aircraftRef.current);

  useFrame((_, delta) => {
    if (!aircraftRef.current) return;

    const aircraft = aircraftRef.current;

    const pitch =
      (telemetry.pitch * Math.PI) / 180;

    const visualRoll = THREE.MathUtils.clamp(
      Number(telemetry.roll) || 0,
      -45,
      45
    );

    const roll =
      (-visualRoll * Math.PI) / 180;

    const heading =
      (-telemetry.heading * Math.PI) / 180;

    // Smooth pitch
    aircraft.rotation.x +=
      (pitch - aircraft.rotation.x) * 0.05;

    // Smooth roll
    aircraft.rotation.z +=
      (roll - aircraft.rotation.z) * 0.05;

    // Heading
    aircraft.rotation.y = heading;

    // Throttle speed or upward MPU pitch can start forward movement.
    const pitchInput = Math.max(0, Number(telemetry.pitch) || 0);
    const movementRate = Math.max(
      Number(telemetry.speed) || 0,
      pitchInput * 8
    );
    const forwardSpeed =
      -(movementRate / 25) * delta;

    if (pitchInput > 2 || telemetry.speed > 1) {
      aircraft.translateZ(forwardSpeed);
    }

    // Simple takeoff / descent
    if (telemetry.speed > 120) {
      aircraft.position.y +=
        telemetry.pitch * 0.025 * delta;
    }

    // Keep the aircraft body just above the runway surface.
    if (aircraft.position.y < 1.1) {
      aircraft.position.y = 1.1;
    }
  });

  return (
    <group
      ref={aircraftRef}
      position={[0, 1.1, 0]}
    >
      <primitive
        object={scene}
        scale={0.003}
        rotation={[
          -Math.PI / 2,
          0,
          Math.PI / 2,
        ]}
      />
    </group>
  );
});

Aircraft.displayName = "Aircraft";

useGLTF.preload("/models/aircraft.glb");

export default Aircraft;