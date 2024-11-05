import { useGLTF } from '@react-three/drei';
import { useRef, useEffect } from 'react';
import { Group, SkinnedMesh } from 'three';

interface MorphTargets {
  [key: string]: number;
}

interface AvatarProps {
  morphTargets: MorphTargets;
}

// Pre-load the model to avoid loading issues
useGLTF.preload(
  'https://models.readyplayer.me/669bfa4c553871e7ca76cfca.glb?morphTargets=Oculus+Visemes'
);

export function Avatar({ morphTargets }: AvatarProps) {
  const group = useRef<Group>(null);
  const { nodes, materials } = useGLTF(
    'https://models.readyplayer.me/669bfa4c553871e7ca76cfca.glb?morphTargets=Oculus+Visemes'
  );

  // Update morph target influences when they change
  useEffect(() => {
    const head = group.current?.getObjectByName('Wolf3D_Head') as SkinnedMesh;
    console.log('UseEffect: ', head);
    if (head?.morphTargetDictionary && head?.morphTargetInfluences) {
      console.log('morphTargets: ', morphTargets);
      Object.entries(morphTargets).forEach(([name, value]) => {
        const index = head.morphTargetDictionary ? head.morphTargetDictionary[name] : undefined;
        if (typeof index !== 'undefined') {
          if (head.morphTargetInfluences) {
            head.morphTargetInfluences[index] = value;
          }
        }
      });
    }
  }, [morphTargets]);

  return (
    <group
      ref={group}
      dispose={null}
      rotation={[-0.6, 0, 0]}
      position={[0, 0.8, 3.1]}
    >
      <primitive object={nodes.Hips} />
      <skinnedMesh
        geometry={(nodes.Wolf3D_Body as SkinnedMesh).geometry}
        material={materials.Wolf3D_Body}
        skeleton={(nodes.Wolf3D_Body as SkinnedMesh).skeleton}
      />
      <skinnedMesh
        geometry={(nodes.Wolf3D_Outfit_Bottom as SkinnedMesh).geometry}
        material={materials.Wolf3D_Outfit_Bottom}
        skeleton={(nodes.Wolf3D_Outfit_Bottom as SkinnedMesh).skeleton}
      />
      <skinnedMesh
        geometry={(nodes.Wolf3D_Outfit_Footwear as SkinnedMesh).geometry}
        material={materials.Wolf3D_Outfit_Footwear}
        skeleton={(nodes.Wolf3D_Outfit_Footwear as SkinnedMesh).skeleton}
      />
      <skinnedMesh
        geometry={(nodes.Wolf3D_Outfit_Top as SkinnedMesh).geometry}
        material={materials.Wolf3D_Outfit_Top}
        skeleton={(nodes.Wolf3D_Outfit_Top as SkinnedMesh).skeleton}
      />
      <skinnedMesh
        geometry={(nodes.Wolf3D_Hair as SkinnedMesh).geometry}
        material={materials.Wolf3D_Hair}
        skeleton={(nodes.Wolf3D_Hair as SkinnedMesh).skeleton}
      />
      <skinnedMesh
        name="EyeLeft"
        geometry={(nodes.EyeLeft as SkinnedMesh).geometry}
        material={materials.Wolf3D_Eye}
        skeleton={(nodes.EyeLeft as SkinnedMesh).skeleton}
        morphTargetDictionary={(nodes.EyeLeft as SkinnedMesh).morphTargetDictionary}
        morphTargetInfluences={(nodes.EyeLeft as SkinnedMesh).morphTargetInfluences}
      />
      <skinnedMesh
        name="EyeRight"
        geometry={(nodes.EyeRight as SkinnedMesh).geometry}
        material={materials.Wolf3D_Eye}
        skeleton={(nodes.EyeRight as SkinnedMesh).skeleton}
        morphTargetDictionary={(nodes.EyeRight as SkinnedMesh).morphTargetDictionary}
        morphTargetInfluences={(nodes.EyeRight as SkinnedMesh).morphTargetInfluences}
      />
      <skinnedMesh
        name="Wolf3D_Head"
        geometry={(nodes.Wolf3D_Head as SkinnedMesh).geometry}
        material={materials.Wolf3D_Skin}
        skeleton={(nodes.Wolf3D_Head as SkinnedMesh).skeleton}
        morphTargetDictionary={(nodes.Wolf3D_Head as SkinnedMesh).morphTargetDictionary}
        morphTargetInfluences={(nodes.Wolf3D_Head as SkinnedMesh).morphTargetInfluences}
      />
      <skinnedMesh
        name="Wolf3D_Teeth"
        geometry={(nodes.Wolf3D_Teeth as SkinnedMesh).geometry}
        material={materials.Wolf3D_Teeth}
        skeleton={(nodes.Wolf3D_Teeth as SkinnedMesh).skeleton}
        morphTargetDictionary={(nodes.Wolf3D_Teeth as SkinnedMesh).morphTargetDictionary}
        morphTargetInfluences={(nodes.Wolf3D_Teeth as SkinnedMesh).morphTargetInfluences}
      />
    </group>
  );
}
