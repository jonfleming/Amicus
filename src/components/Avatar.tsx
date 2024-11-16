import { useGLTF } from '@react-three/drei';
import { useRef, useEffect } from 'react';
import { Group, SkinnedMesh } from 'three';
import { GLTF } from 'three-stdlib'
import { useLoader } from '@react-three/fiber';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import * as THREE from 'three';

interface MorphTargets {
  [key: string]: number;
}

type GLTFResult = GLTF & {
  nodes: { [key: string]: THREE.Mesh }
  materials: { [key: string]: THREE.Material }
}

export type AnimationType = 'idle' | 'walk' | 'dance' | 'excited' | 'standing' | 'none';

interface AvatarProps {
  readonly morphTargets: MorphTargets;
  readonly animation: AnimationType;
  onAnimationStart: () => void;
  setCameraPosition: (position: any) => void;
}

const animationStartPosition = {
  "target": {
      "x": 0.17697423079506147,
      "y": 2.474099976437292,
      "z": 2.4244568176728443
  },
  "position": {
      "x": -0.07143141521359608,
      "y": 0.30771805857413037,
      "z": 4.973002289306958
  },
  "zoom": 1
}

const initialState = {
  "target": {
      "x": 0,
      "y": 0.028495354854373618,
      "z": -0.01424767742718681
  },
  "position": {
      "x": 0,
      "y": 1.528495354854374,
      "z": 2.985752322572813
  },
  "zoom": 1
}

// morphtargets are the visemes
// animation is the animation type
// onAnimationStart is a function that gets called when the animation starts
// setCameraPosition is a function that sets the camera position
// clip is the animation clip
// action is the animation action
export function Avatar({ morphTargets, animation, onAnimationStart, setCameraPosition }: Readonly<AvatarProps>) {
  const group = useRef<Group>(null);
  const { nodes, materials } = useGLTF("/office-lady.glb") as GLTFResult;
  const animations = {
    idle: useLoader(FBXLoader, "/Idle.fbx"),
    walk: useLoader(FBXLoader, "/Catwalk.fbx"),
    dance: useLoader(FBXLoader, "/Rumba.fbx"),
    excited: useLoader(FBXLoader, "/Excited.fbx"),
    standing: useLoader(FBXLoader, "/Standing.fbx"),
    none: null,
  }
  
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const previousAction = useRef<THREE.AnimationAction | null>(null)
  const lastAnimation = useRef<AnimationType | null>(null)

  // Initialize mixer
  useEffect(() => {
    if (group.current) {
      mixerRef.current = new THREE.AnimationMixer(group.current);
    }
  }, []);

  // Handle animations
  useEffect(() => {
    console.log('Avatar Animation:', animation);

    if (!mixerRef.current) return;
    if (animation == 'none') {
      setCameraPosition(initialState);
      return;
    }

    const clip = animations[animation].animations[0];
    console.log('clip:', clip);

    if (clip && lastAnimation.current !== animation) {      
      
      if (previousAction.current) {
        console.log('fading animation:', animation);
        previousAction.current.fadeOut(0.5);
      }
      
      console.log('Setting Camera and Playing animation:', animation);
      // onAnimationStart();
      setCameraPosition(animationStartPosition);
      const action = mixerRef.current.clipAction(clip);
      
      // Set animation to play only once
      action.setLoop(THREE.LoopOnce, 1);
      action.time = 0;
      action.timeScale = 1;
      action.startAt(0);
      action.setDuration(5); // clip.duration
      action.clampWhenFinished = true;
      
      action.reset().fadeIn(0.5).play();
            
      previousAction.current = action;
      lastAnimation.current = animation;
    }

    return () => {
      if (previousAction.current) {
        console.log('Stopping animation:', animation);
        previousAction.current.fadeOut(0.5).stop();
      }
    };
  }, [animation]);

  // Animation update loop
  useEffect(() => {
    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      mixerRef.current?.update(0.016); // Update at ~60fps
    };
    animate();
    return () => cancelAnimationFrame(frameId);
  }, []);

  // Function to update morph targets
  const updateMorphTargets = () => {
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
  };

  // Handle morph targets
  useEffect(() => {
    updateMorphTargets();
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
