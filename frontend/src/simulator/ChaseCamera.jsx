import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useEffect, useMemo } from "react";
import { CAMERA_VIEWS } from "./sceneSettings";

const ChaseCamera = ({ aircraftRef, cameraMode = 'chase' }) => {
  const { camera, invalidate } = useThree();
  const view = CAMERA_VIEWS[cameraMode];

  const [cameraTarget, lookTarget, headingRotation, worldUp] = useMemo(() => [new THREE.Vector3(), new THREE.Vector3(), new THREE.Quaternion(), new THREE.Vector3(0, 1, 0)], []);
  useEffect(() => {
    camera.fov = view.fov;
    camera.updateProjectionMatrix();
    invalidate();
  }, [camera, view, invalidate]);

  useFrame(({ invalidate, frameloop }) => {
    if (!aircraftRef.current) return;

    const aircraft = aircraftRef.current;

    // Follow heading while keeping the camera above the runway during pitch/roll.
    headingRotation.setFromAxisAngle(worldUp, aircraft.rotation.y);
    cameraTarget.set(...view.offset);
    cameraTarget.applyQuaternion(
      headingRotation
    );
    cameraTarget.add(aircraft.position);

    camera.position.lerp(
      cameraTarget,
      0.06
    );

    // Look in front of aircraft
    lookTarget.set(...view.target);
    lookTarget.applyQuaternion(
      headingRotation
    );
    lookTarget.add(aircraft.position);

    camera.lookAt(lookTarget);
    if (frameloop === 'demand' && camera.position.distanceToSquared(cameraTarget) > .0001) invalidate();
  });

  return null;
};

export default ChaseCamera;
