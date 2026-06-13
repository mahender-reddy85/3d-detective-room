import { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import Workroom from './Workroom';

interface ThreeSceneProps {
  isNight: boolean;
}

function useKeyboard() {
  const keys = useRef({
    w: false,
    a: false,
    s: false,
    d: false,
    arrowup: false,
    arrowdown: false,
    arrowleft: false,
    arrowright: false,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (['w', 'a', 's', 'd'].includes(k)) {
        keys.current[k as 'w' | 'a' | 's' | 'd'] = true;
      } else if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(k)) {
        keys.current[k as 'arrowup' | 'arrowdown' | 'arrowleft' | 'arrowright'] = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (['w', 'a', 's', 'd'].includes(k)) {
        keys.current[k as 'w' | 'a' | 's' | 'd'] = false;
      } else if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(k)) {
        keys.current[k as 'arrowup' | 'arrowdown' | 'arrowleft' | 'arrowright'] = false;
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

function WASDControls({ controlsRef }: { controlsRef: React.RefObject<any> }) {
  const { camera } = useThree();
  const keys = useKeyboard();

  useFrame((state, delta) => {
    const activeKeys = keys.current;
    const hasInput = activeKeys.w || activeKeys.a || activeKeys.s || activeKeys.d ||
                     activeKeys.arrowup || activeKeys.arrowdown || activeKeys.arrowleft || activeKeys.arrowright;

    if (!hasInput || !controlsRef.current) return;

    const speed = 4.5 * delta;

    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();

    const right = new THREE.Vector3();
    right.crossVectors(forward, camera.up).normalize();

    const moveVector = new THREE.Vector3();
    if (activeKeys.w || activeKeys.arrowup) moveVector.addScaledVector(forward, speed);
    if (activeKeys.s || activeKeys.arrowdown) moveVector.addScaledVector(forward, -speed);
    if (activeKeys.a || activeKeys.arrowleft) moveVector.addScaledVector(right, speed);
    if (activeKeys.d || activeKeys.arrowright) moveVector.addScaledVector(right, -speed);

    const tgt = controlsRef.current.target;
    const nextTgt = tgt.clone().add(moveVector);

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

function Cursor3D() {
  const cursorRef = useRef<THREE.Group>(null);
  const outerRef = useRef<THREE.Mesh>(null);
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

      hitPt.copy(hit.point);
      if (hit.face) {
        hitNorm.copy(hit.face.normal);
        hitNorm.transformDirection(hit.object.matrixWorld);
      }
      foundHit = true;

      let testObj: THREE.Object3D | null = hit.object;
      while (testObj) {
        const name = testObj.name || '';
        if (
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
        const targetPos = hitPt.clone().addScaledVector(hitNorm, 0.035);
        cursorRef.current.position.lerp(targetPos, 0.35);

        const lookTarget = cursorRef.current.position.clone().add(hitNorm);
        cursorRef.current.lookAt(lookTarget);

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
  });

  const cursorColor = hovered ? '#ff007f' : '#00f0ff';

  return (
    <group ref={cursorRef} scale={[0, 0, 0]} userData={{ isCursor: true }}>
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

export default function ThreeScene({ isNight }: ThreeSceneProps) {
  const [isDraggingChair, setIsDraggingChair] = useState(false);
  const controlsRef = useRef<any>(null);

  return (
    <div id="webgl-canvas-viewport" className={`w-full h-full relative transition-colors duration-500 cursor-none ${isNight ? 'bg-[#04040a]' : 'bg-[#cbd5e1]'}`}>
      <Canvas
        camera={{ position: [0, 1.8, 7.0], fov: 60, near: 0.1, far: 50 }}
        gl={{ antialias: true }}
      >
        <ambientLight intensity={isNight ? 0.2 : 0.85} color={isNight ? '#0b0b28' : '#e2e8f0'} />

        <hemisphereLight
          intensity={isNight ? 0.3 : 0.85}
          color="#00f0ff"
          groundColor="#ff007f"
        />

        <spotLight
          position={[0, 4.0, -2.0]}
          angle={Math.PI / 3}
          penumbra={0.8}
          intensity={isNight ? 2.2 : 4.5}
          color="#00f0ff"
        />

        <pointLight
          position={[0, -0.2, -1.5]}
          intensity={isNight ? 1.4 : 2.5}
          distance={8}
          color="#ff007f"
        />

        <Workroom
          isNight={isNight}
          onChairDragChange={setIsDraggingChair}
        />

        <Cursor3D />

        <WASDControls controlsRef={controlsRef} />

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
      </Canvas>
    </div>
  );
}
