import { useGLTF, useAnimations } from '@react-three/drei';
import { useRef, useEffect } from 'react';
import { Group, SkinnedMesh } from 'three';
import { GLTF } from 'three-stdlib'
import * as THREE from 'three';

interface MorphTargets {
  [key: string]: number;
}

type GLTFResult = GLTF & {
  nodes: { [key: string]: THREE.Mesh }
  materials: { [key: string]: THREE.Material }
}

export type AnimationType = 'idle' | 'walk' | 'dance' | 'excited';

interface AvatarProps {
  readonly morphTargets: MorphTargets;
  readonly animation: AnimationType;
}

export function Avatar({ morphTargets, animation }: AvatarProps) {
  const group = useRef<Group>(null);
  const { nodes, materials, animations } = useGLTF("/output_model_4.glb") as GLTFResult;
  const { actions, names } = useAnimations(animations, group)
  const previousAction = useRef<THREE.AnimationAction | null>(null)
  const animationMap = {
    idle: 'Animation_Idle',
    walk: 'Animation_Catwalk',
    dance: 'Animation_Rumba',
    excited: 'Animation_Excited',
  } as Record<AnimationType, string>;

  console.log('Avatar Animation:', animation);

  useEffect(() => {
    console.log('Available Animations:', names);
    const action = actions[animationMap[animation]];

    if (action) {
      if (previousAction.current) {
        console.log('fading animation:', animationMap[animation]);
        previousAction.current.fadeOut(0.5);
      }
      console.log('Playing animation:', animationMap[animation]);
      action.reset().fadeIn(0.5).play();

      previousAction.current = action
    }

    return () => {
      if (previousAction.current) {
        console.log('Stopping animation:', animationMap[animation]);
        previousAction.current.fadeOut(0.5).stop();
      }
    };
  }, [animation])
  
  useEffect(() => {
    const head = group.current?.getObjectByName('Wolf3D_Head') as SkinnedMesh;
    const teeth = group.current?.getObjectByName('Wolf3D_Teeth') as SkinnedMesh;

    if (head) {
      const headDict = head.morphTargetDictionary;
      const headInfluences = head.morphTargetInfluences;
      if (headDict && headInfluences) {
        Object.entries(morphTargets).forEach(([name, value]) => {
          const index = headDict[name];
          if (typeof index !== 'undefined') {
            headInfluences[index] = value;
          }
        });
      }
    }

    if (teeth) {
      const teethDict = teeth.morphTargetDictionary;
      const teethInfluences = teeth.morphTargetInfluences;
      if (teethDict && teethInfluences) {
        Object.entries(morphTargets).forEach(([name, value]) => {
          const index = teethDict[name];
          if (typeof index !== 'undefined') {
            teethInfluences[index] = value;
          }
        });
      }
    }
  }, [morphTargets]);

  return (
    <group ref={group} dispose={null} rotation={[-0.6, 0, 0]} position={[0, 0.8, 3.1]}>
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
