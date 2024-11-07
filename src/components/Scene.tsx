import React, { Suspense, useRef, useState, useEffect } from 'react';
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Avatar } from './Avatar';
import type { AnimationType } from './Avatar';

interface SceneProps {
  morphTargets: Record<string, number>;
  animation: AnimationType;
}

export function Scene({ morphTargets, animation }: Readonly<SceneProps>) {
  const orbitControlsRef = useRef(null);
  const [camera, setCamera] = useState<{ target: any; position: any; zoom: any } | undefined>(undefined);

  const saveCameraPosition = () => {
    if (orbitControlsRef.current) {
      const controls = orbitControlsRef.current as any;
      const currentPosition = {
        target: controls.target.clone(),
        position: controls.object.position.clone(),
        zoom: controls.object.zoom,
      }
      console.log('Position:', currentPosition);
      
      return currentPosition;
    }
  }

  const restoreCameraPosition = () => {
    if (orbitControlsRef.current && camera) {
      const controls = orbitControlsRef.current as any;
      controls.target.copy(camera.target);
      controls.object.position.copy(camera.position);
      controls.object.zoom = camera.zoom;
      controls.update();
    }
  }
  
  const setCameraPosition = (position: any) => {
    if (orbitControlsRef.current) {
      const controls = orbitControlsRef.current as any;
      controls.target.copy(position.target);
      controls.object.position.copy(position.position);
      controls.object.zoom = position.zoom;
      controls.update();
    }
  }

  return (
    <Canvas shadows>
      <Suspense fallback={null}>
      
        <PerspectiveCamera makeDefault position={[0, 1.5, 3]} />
        <OrbitControls
          ref={orbitControlsRef}
          minPolarAngle={0}
          maxPolarAngle={Math.PI}
          minDistance={2}
          maxDistance={6}
          onChange={(e) => {
            setCamera(saveCameraPosition());
          }}
		/>
        <Environment preset="city" />
        <directionalLight position={[0, 2, 5]} intensity={1.5} />
        <group position={[0, -1, 0]}>
          <Avatar morphTargets={morphTargets} animation={animation} onAnimationStart={restoreCameraPosition} setCameraPosition={setCameraPosition} />
          <ContactShadows
            opacity={0.6}
            scale={5}
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
