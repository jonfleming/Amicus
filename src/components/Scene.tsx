import { OrbitControls, PerspectiveCamera, Environment, ContactShadows } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Suspense, useState } from 'react';
import { Avatar } from './Avatar';
import { MorphControls } from './MorphControls';

interface SceneProps {
  morphTargets: Record<string, number>;
}

export function Scene({ morphTargets }: SceneProps) {
  return (
    <Canvas shadows>
      <Suspense fallback={null}>
        <PerspectiveCamera makeDefault position={[0, 1.5, 3]} />
        <OrbitControls
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 2}
          minDistance={2}
          maxDistance={6}
        />
        
        <Environment preset="city" />
        
        <group position={[0, -1, 0]}>
          <Avatar morphTargets={morphTargets} />
          <ContactShadows
            opacity={0.6}
            scale={10}
            blur={1}
            far={10}
            resolution={256}
            color="#000000"
          />
        </group>
      </Suspense>
    </Canvas>
  );
}