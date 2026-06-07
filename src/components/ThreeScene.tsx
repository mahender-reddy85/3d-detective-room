/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { SceneSection } from '../types';
import Workroom from './Workroom';

interface ThreeSceneProps {
  currentSection: SceneSection;
  onSelectSection: (section: SceneSection) => void;
  isNight: boolean;
}

// Camera coordinates mapping for each focused workspace node
const CAMERA_TARGETS: Record<
  SceneSection,
  { position: [number, number, number]; lookAt: [number, number, number] }
> = {
  ROOM: {
    position: [0, 1.2, 5.0],
    lookAt: [0, 0.2, -1.5],
  },
  ABOUT: {
    position: [-0.6, 0.88, -1.2], // close-up view of double monitors
    lookAt: [-0.8, 0.7, -3.2],
  },
  PROJECTS: {
    position: [0.65, 0.42, -1.0], // close-up view of open glowing laptop
    lookAt: [0.8, 0.18, -3.0],
  },
  SKILLS: {
    position: [2.5, 0.5, -1.5], // close-up targeting voxel books on bookshelf
    lookAt: [4.2, 0.3, -3.4],
  },
  CONTACT: {
    position: [-2.4, 0.8, -0.2], // focus looking at circuits poster
    lookAt: [-5.9, 0.8, -1.8],
  },
};

// Key state listener hook for WASD & Arrow Keys
function useKeyboard() {
  const keys = useRef({
    w: false,
    a: false,
    s: false,
    d: false,
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (['w', 'a', 's', 'd'].includes(k)) {
        keys.current[k as 'w' | 'a' | 's' | 'd'] = true;
      } else if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(e.key)) {
        keys.current[e.key as 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight'] = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (['w', 'a', 's', 'd'].includes(k)) {
        keys.current[k as 'w' | 'a' | 's' | 'd'] = false;
      } else if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(e.key)) {
        keys.current[e.key as 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight'] = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return keys;
}

// WASD Navigation Engine for First-Person Room Exploration
function WASDControls({ controlsRef }: { controlsRef: React.RefObject<any> }) {
  const { camera } = useThree();
  const keys = useKeyboard();

  useFrame((state, delta) => {
    const activeKeys = keys.current;
    const hasInput = activeKeys.w || activeKeys.a || activeKeys.s || activeKeys.d ||
                     activeKeys.ArrowUp || activeKeys.ArrowDown || activeKeys.ArrowLeft || activeKeys.ArrowRight;

    if (!hasInput || !controlsRef.current) return;

    // Fluid frame-rate independent exploration speed
    const speed = 4.5 * delta;

    // Look vector mapped on XZ plane
    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();

    // Side vector
    const right = new THREE.Vector3();
    right.crossVectors(forward, camera.up).normalize();

    const moveVector = new THREE.Vector3();
    if (activeKeys.w || activeKeys.ArrowUp) moveVector.addScaledVector(forward, speed);
    if (activeKeys.s || activeKeys.ArrowDown) moveVector.addScaledVector(forward, -speed);
    if (activeKeys.a || activeKeys.ArrowLeft) moveVector.addScaledVector(right, speed);
    if (activeKeys.d || activeKeys.ArrowRight) moveVector.addScaledVector(right, -speed);

    // Update orbit targets & positions
    const tgt = controlsRef.current.target;
    const nextTgt = tgt.clone().add(moveVector);

    // Confine viewer to room bounds (X: -5.5 to 5.5, Z: -4.5 to 4.5)
    nextTgt.x = THREE.MathUtils.clamp(nextTgt.x, -5.5, 5.5);
    nextTgt.z = THREE.MathUtils.clamp(nextTgt.z, -4.5, 4.5);
    nextTgt.y = THREE.MathUtils.clamp(nextTgt.y, -0.5, 2.0);

    const actualMove = nextTgt.clone().sub(tgt);
    camera.position.add(actualMove);
    tgt.copy(nextTgt);

    controlsRef.current.update();
  });

  return null;
}

// Holographic interactive 3D cursor wrapping meshes in real-time
function Cursor3D() {
  const cursorRef = useRef<THREE.Group>(null);
  const outerRef = useRef<THREE.Mesh>(null);
  const innerRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    const { raycaster, scene } = state;
    const hits = raycaster.intersectObjects(scene.children, true);

    let foundHit = false;
    let hitPt = new THREE.Vector3();
    let hitNorm = new THREE.Vector3(0, 1, 0);
    let interactive = false;

    for (let i = 0; i < hits.length; i++) {
      const hit = hits[i];

      // Exclude components belonging to the cursor
      let isCursorMesh = false;
      let checkObj: THREE.Object3D | null = hit.object;
      while (checkObj) {
        if (checkObj.userData?.isCursor) {
          isCursorMesh = true;
          break;
        }
        checkObj = checkObj.parent;
      }

      if (isCursorMesh) continue;

      // Valid surface hit
      hitPt.copy(hit.point);
      if (hit.face) {
        hitNorm.copy(hit.face.normal);
        hitNorm.transformDirection(hit.object.matrixWorld);
      }
      foundHit = true;

      // Check if hovered element is workspace interactive
      let testObj: THREE.Object3D | null = hit.object;
      while (testObj) {
        const name = testObj.name || '';
        if (
          name.includes('laptop-interactive-mesh') ||
          name.includes('monitors-assembly') ||
          name.includes('poster-interactive-mesh') ||
          name.includes('bookshelf-assembly') ||
          name.includes('coffee-mug-interactive') ||
          name.includes('desk-lamp-interactive') ||
          name.includes('cyberspace-cockpit-chair')
        ) {
          interactive = true;
          break;
        }
        testObj = testObj.parent;
      }
      break;
    }

    if (hovered !== interactive) {
      setHovered(interactive);
    }

    if (cursorRef.current) {
      if (foundHit) {
        // Position slightly offset over surface
        const targetPos = hitPt.clone().addScaledVector(hitNorm, 0.035);
        cursorRef.current.position.lerp(targetPos, 0.35);

        // Orient perpendicular to face normal
        const lookTarget = cursorRef.current.position.clone().add(hitNorm);
        cursorRef.current.lookAt(lookTarget);

        // Adjust spatial scale on hover
        const scaleVal = interactive ? 1.3 : 0.85;
        cursorRef.current.scale.lerp(new THREE.Vector3(scaleVal, scaleVal, scaleVal), 0.25);
      } else {
        cursorRef.current.scale.lerp(new THREE.Vector3(0, 0, 0), 0.25);
      }
    }

    const t = state.clock.getElapsedTime();
    if (outerRef.current) {
      outerRef.current.rotation.z = t * (interactive ? 4.5 : 1.2);
    }
    if (innerRef.current) {
      innerRef.current.rotation.z = -t * (interactive ? 6.0 : 2.0);
    }
  });

  const cursorColor = hovered ? '#ff007f' : '#00f0ff';

  return (
    <group ref={cursorRef} scale={[0, 0, 0]} userData={{ isCursor: true }}>
      {/* Outer spinning ring segment */}
      <mesh ref={outerRef} userData={{ isCursor: true }}>
        <ringGeometry args={[0.07, 0.09, 16]} />
        <meshBasicMaterial 
          color={cursorColor} 
          transparent 
          opacity={0.8} 
          side={THREE.DoubleSide} 
          depthWrite={false}
          depthTest={false}
        />
      </mesh>

      {/* Inner tick target */}
      <mesh ref={innerRef} userData={{ isCursor: true }}>
        <ringGeometry args={[0, 0.015, 4]} />
        <meshBasicMaterial 
          color={cursorColor} 
          transparent 
          opacity={0.9} 
          side={THREE.DoubleSide} 
          depthWrite={false}
          depthTest={false}
        />
      </mesh>

      {/* Crosshair horizontal & vertical alignments */}
      <group userData={{ isCursor: true }}>
        <mesh userData={{ isCursor: true }}>
          <boxGeometry args={[0.045, 0.005, 0.001]} />
          <meshBasicMaterial color={cursorColor} depthWrite={false} depthTest={false} />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 2]} userData={{ isCursor: true }}>
          <boxGeometry args={[0.045, 0.005, 0.001]} />
          <meshBasicMaterial color={cursorColor} depthWrite={false} depthTest={false} />
        </mesh>
      </group>
    </group>
  );
}

// Internal Camera Rig to handle vector interpolation smoothly and release keys control safely
interface CameraRigProps {
  currentSection: SceneSection;
  isTransitioningToRoom: boolean;
  setIsTransitioningToRoom: (trans: boolean) => void;
}

function CameraRig({ currentSection, isTransitioningToRoom, setIsTransitioningToRoom }: CameraRigProps) {
  const { camera } = useThree();
  const currentLookAt = useRef<THREE.Vector3>(new THREE.Vector3(0, 0.2, -1.5));
  const targetLookAt = useRef<THREE.Vector3>(new THREE.Vector3(0, 0.2, -1.5));
  const targetPos = useRef<THREE.Vector3>(new THREE.Vector3(0, 1.2, 5.0));

  // Update target coordinates whenever section shifts
  useEffect(() => {
    const target = CAMERA_TARGETS[currentSection] || CAMERA_TARGETS.ROOM;
    targetPos.current.set(...target.position);
    targetLookAt.current.set(...target.lookAt);

    if (currentSection === 'ROOM') {
      setIsTransitioningToRoom(true);
    } else {
      setIsTransitioningToRoom(false);
    }
  }, [currentSection, setIsTransitioningToRoom]);

  useFrame(() => {
    // interpolation runs only if we are in viewport details or animating back to ROOM base coords
    if (currentSection !== 'ROOM' || isTransitioningToRoom) {
      camera.position.lerp(targetPos.current, 0.075);
      currentLookAt.current.lerp(targetLookAt.current, 0.075);
      camera.lookAt(currentLookAt.current);

      if (currentSection === 'ROOM' && isTransitioningToRoom) {
        if (camera.position.distanceTo(targetPos.current) < 0.05) {
          setIsTransitioningToRoom(false);
        }
      }
    }
  });

  return null;
}

export default function ThreeScene({ currentSection, onSelectSection, isNight }: ThreeSceneProps) {
  const [isTransitioningToRoom, setIsTransitioningToRoom] = useState(false);
  const [isDraggingChair, setIsDraggingChair] = useState(false);
  const controlsRef = useRef<any>(null);

  return (
    <div id="webgl-canvas-viewport" className={`w-full h-full relative transition-colors duration-500 cursor-none ${isNight ? 'bg-[#04040a]' : 'bg-[#cbd5e1]'}`}>
      <Canvas
        shadows
        camera={{ position: [0, 1.2, 5.0], fov: 60, near: 0.1, far: 50 }}
        gl={{ antialias: true }}
        style={{ backgroundColor: '#dc7676' }}
      >
        {/* Cinematic Cyberpunk Lighting Rig */}
        {/* Deep background ambient neon backlighting */}
        <ambientLight intensity={isNight ? 0.2 : 0.85} color={isNight ? '#0b0b28' : '#e2e8f0'} />

        {/* Global hemispheric twilight sky filter */}
        <hemisphereLight
          intensity={isNight ? 0.3 : 0.85}
          color="#00f0ff"
          groundColor="#ff007f"
        />

        {/* Focused workspace overhead spotlight */}
        <spotLight
          position={[0, 4.0, -2.0]}
          angle={Math.PI / 3}
          penumbra={0.8}
          intensity={isNight ? 2.2 : 4.5}
          color="#00f0ff"
          castShadow
          shadow-mapSize={[1024, 1024]}
        />

        {/* Laptop/Desktop ambient bouncing light */}
        <pointLight
          position={[0, -0.2, -1.5]}
          intensity={isNight ? 1.4 : 2.5}
          distance={8}
          color="#ff007f"
        />

        {/* The procedural modeled 3D cozy workspace cockpit */}
        <Workroom
          currentSection={currentSection}
          onSelectSection={onSelectSection}
          isNight={isNight}
          onChairDragChange={setIsDraggingChair}
        />

        {/* Dynamic Custom Hologram Cursor */}
        <Cursor3D />

        {/* Vector Linear Lerping Camera Rig */}
        <CameraRig 
          currentSection={currentSection} 
          isTransitioningToRoom={isTransitioningToRoom}
          setIsTransitioningToRoom={setIsTransitioningToRoom}
        />

        {/* WASD controls for room tracking */}
        {currentSection === 'ROOM' && !isTransitioningToRoom && (
          <WASDControls controlsRef={controlsRef} />
        )}

        {/* Allow users to orbit and explore the room via dragging ONLY while in general explorer mode */}
        {currentSection === 'ROOM' && (
          <OrbitControls
            ref={controlsRef}
            enableZoom={true}
            minDistance={2.5}
            maxDistance={7.5}
            minPolarAngle={0.3}
            maxPolarAngle={Math.PI / 2 + 0.05}
            target={[0, 0, -1.5]}
            enabled={!isDraggingChair}
          />
        )}
      </Canvas>
    </div>
  );
}
