import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const ChaseCamera = ({ aircraftRef }) => {
  const { camera } = useThree();

  const cameraTarget = new THREE.Vector3();
  const lookTarget = new THREE.Vector3();

  useFrame(() => {
    if (!aircraftRef.current) return;

    const aircraft = aircraftRef.current;

    // Camera behind aircraft
    cameraTarget.set(0, 5, 14);
    cameraTarget.applyQuaternion(
      aircraft.quaternion
    );
    cameraTarget.add(aircraft.position);

    camera.position.lerp(
      cameraTarget,
      0.06
    );

    // Look in front of aircraft
    lookTarget.set(0, 1, -10);
    lookTarget.applyQuaternion(
      aircraft.quaternion
    );
    lookTarget.add(aircraft.position);

    camera.lookAt(lookTarget);
  });

  return null;
};

export default ChaseCamera;