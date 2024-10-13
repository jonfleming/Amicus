import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}

export function AvatarViewer() {
  return (
    <Canvas>
      <ambientLight intensity={0.5} />
      <directionalLight position={[0, 5, 5]} />
      <OrbitControls />
      <Model url="/office-lady.glb" />
    </Canvas>
  );
}
