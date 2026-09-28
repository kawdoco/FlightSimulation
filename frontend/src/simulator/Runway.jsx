const Runway = () => {
  const markings = Array.from({ length: 24 });

  return (
    <group>
      {/* Grass */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.11, -30]}
      >
        <planeGeometry args={[300, 400]} />
        <meshStandardMaterial color="#426b3a" />
      </mesh>

      {/* Runway */}
      <mesh position={[0, 0, -35]}>
        <boxGeometry args={[14, 0.2, 160]} />
        <meshStandardMaterial color="#25282c" />
      </mesh>

      {/* Center markings */}
      {markings.map((_, index) => (
        <mesh
          key={index}
          position={[
            0,
            0.12,
            35 - index * 6,
          ]}
        >
          <boxGeometry args={[0.35, 0.03, 3]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      ))}

      {/* Left edge */}
      <mesh position={[-6.4, 0.12, -35]}>
        <boxGeometry args={[0.15, 0.03, 155]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* Right edge */}
      <mesh position={[6.4, 0.12, -35]}>
        <boxGeometry args={[0.15, 0.03, 155]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
    </group>
  );
};

export default Runway;