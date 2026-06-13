import { useRef, useState } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import { Line, useTexture } from '@react-three/drei';

import * as THREE from 'three';

function PortraitWithFrame() {
  const texture = useTexture('/ambedkar.webp');
  return (
    <group>
      
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[1.58, 1.55]} />
        <meshBasicMaterial map={texture} />
      </mesh>
      
    </group>
  );
}

interface WorkroomProps {
  isNight: boolean;
  onChairDragChange?: (isDragging: boolean) => void;
}

export default function Workroom({
  isNight,
  onChairDragChange,
}: WorkroomProps) {
  const fanRef = useRef<THREE.Group>(null);
  const mugRef = useRef<THREE.Group>(null);
  const lampRef = useRef<THREE.Group>(null);
  const keyboardRef = useRef<THREE.Group>(null);
  const waterCanRef = useRef<THREE.Group>(null);
  const waterDropsRef = useRef<THREE.Group>(null);
  const hologramRef = useRef<THREE.Mesh>(null);
  const cameraSwivelRef = useRef<THREE.Group>(null);


  const [lampIntensityState, setLampIntensityState] = useState<'off' | 'dim' | 'bright'>('bright');
  const [mugTargetRot, setMugTargetRot] = useState(0);
  const [isWatering, setIsWatering] = useState(false);

  const [chairRot, setChairRot] = useState(-0.05);
  const isDraggingChair = useRef(false);
  const prevPointerX = useRef(0);
  const chairRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();

    if (fanRef.current) {
      fanRef.current.rotation.y = t * 1.8;
    }

    if (mugRef.current) {
      mugRef.current.rotation.y = THREE.MathUtils.lerp(mugRef.current.rotation.y, mugTargetRot, 5 * delta);
    }

    if (hologramRef.current) {
      hologramRef.current.rotation.y = t * 0.5;
      hologramRef.current.rotation.x = t * 0.3;
    }

    if (cameraSwivelRef.current) {
      cameraSwivelRef.current.rotation.y = Math.sin(t * 0.8) * 0.7;
    }

    if (chairRef.current) {
      chairRef.current.rotation.y = THREE.MathUtils.lerp(chairRef.current.rotation.y, chairRot, 6 * delta);
    }

    if (lampRef.current) {
      const targetRotY = -0.6;
      const targetRotZ = 0;
      lampRef.current.rotation.y = THREE.MathUtils.lerp(lampRef.current.rotation.y, targetRotY, 8 * delta);
      lampRef.current.rotation.z = THREE.MathUtils.lerp(lampRef.current.rotation.z, targetRotZ, 8 * delta);
    }

    if (keyboardRef.current) {
      const targetY = 0.08;
      const targetScale = 1.0;
      keyboardRef.current.position.y = THREE.MathUtils.lerp(keyboardRef.current.position.y, targetY, 8 * delta);
      keyboardRef.current.scale.setScalar(THREE.MathUtils.lerp(keyboardRef.current.scale.x, targetScale, 10 * delta));
    }

    if (waterCanRef.current) {
      const targetTiltZ = isWatering ? 0.85 : 0;
      const targetTiltX = isWatering ? 0.35 : 0;
      const targetY = isWatering ? 0.22 : 0.08;
      waterCanRef.current.rotation.z = THREE.MathUtils.lerp(waterCanRef.current.rotation.z, targetTiltZ, 8 * delta);
      waterCanRef.current.rotation.x = THREE.MathUtils.lerp(waterCanRef.current.rotation.x, targetTiltX, 8 * delta);
      waterCanRef.current.position.y = THREE.MathUtils.lerp(waterCanRef.current.position.y, targetY, 8 * delta);
    }

    if (waterDropsRef.current) {
      const children = waterDropsRef.current.children;
      children.forEach((child, i) => {
        if (!isWatering) {
          child.scale.setScalar(0);
          child.position.set(-0.35, 0.26, 0.0);
        } else {
          child.scale.setScalar(1);
          const cycle = (t * 2.5 + i * 0.4) % 1.0;
          const startX = -0.35, startY = 0.26, startZ = 0.0;
          const endX = -0.7, endY = -0.05, endZ = -0.15;
          const t_param = cycle;
          const currentX = THREE.MathUtils.lerp(startX, endX, t_param);
          const currentY = THREE.MathUtils.lerp(startY, endY, t_param) - 0.22 * Math.sin(t_param * Math.PI);
          const currentZ = THREE.MathUtils.lerp(startZ, endZ, t_param);
          child.position.set(currentX, currentY, currentZ);
          const sizeFactor = Math.sin(t_param * Math.PI) * 0.035 + 0.01;
          child.scale.setScalar(sizeFactor * 25);
        }
      });
    }
  });

  const handlePointerOver = () => {
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = () => {
    document.body.style.cursor = 'auto';
  };

  const handleMugClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    setMugTargetRot((prev) => prev + Math.PI * 2);
  };

  const handleLampClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    setLampIntensityState((prev) =>
      prev === 'bright' ? 'off' : prev === 'off' ? 'dim' : 'bright'
    );
  };

  const handleWaterCanClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (isWatering) return;
    setIsWatering(true);
    setTimeout(() => {
      setIsWatering(false);
    }, 3800);
  };

  return (
    <group name="workroom-assembly">
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.5, 0]} receiveShadow name="room-floor">
        <planeGeometry args={[12, 10]} />
        <meshStandardMaterial color={isNight ? '#101115' : '#e2e8f0'} roughness={0.85} metalness={0.1} />
      </mesh>

      <group position={[4.5, -2.48, 1.8]} rotation={[-Math.PI / 2, 0, 0.6]} name="magnifying-glass">
        <mesh castShadow position={[0, -0.2, 0]}>
          <cylinderGeometry args={[0.025, 0.02, 0.3, 16]} />
          <meshStandardMaterial color="#4a2e1b" roughness={0.8} />
        </mesh>
        <mesh castShadow position={[0, -0.04, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.04, 16]} />
          <meshStandardMaterial color="#b5a642" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh castShadow position={[0, 0.1, 0]}>
          <torusGeometry args={[0.1, 0.015, 16, 32]} />
          <meshStandardMaterial color="#b5a642" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.098, 0.098, 0.005, 32]} />
          <meshPhysicalMaterial 
            color="#ffffff" 
            transmission={0.95} 
            opacity={1} 
            transparent 
            roughness={0.05} 
            ior={1.5} 
            thickness={0.05} 
          />
        </mesh>
      </group>

      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 4.5, 0]} receiveShadow name="room-ceiling">
        <planeGeometry args={[12, 10]} />
        <meshStandardMaterial color={isNight ? '#101115' : '#e2e8f0'} roughness={0.95} />
      </mesh>

      <mesh position={[0, 1, -5]} receiveShadow name="room-backwall">
        <boxGeometry args={[12, 7, 0.1]} />
        <meshStandardMaterial color={isNight ? '#141517' : '#f3f4f6'} roughness={0.9} metalness={0.15} />
      </mesh>

      <group position={[-5.8, 4.2, -4.8]} name="security-camera">
        <mesh castShadow position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.1, 16]} />
          <meshStandardMaterial color="#050508" metalness={0.8} roughness={0.2} />
        </mesh>
        <group ref={cameraSwivelRef} position={[0, 0, 0.05]}>
          <mesh castShadow position={[0, -0.1, 0.15]} rotation={[-0.4, 0, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 0.3, 16]} />
            <meshStandardMaterial color="#0a0a14" metalness={0.6} roughness={0.4} />
          </mesh>
          <mesh position={[0, -0.15, 0.3]} rotation={[-0.4, 0, 0]}>
            <cylinderGeometry args={[0.06, 0.06, 0.02, 16]} />
            <meshBasicMaterial color="#ff0000" />
          </mesh>
        </group>
      </group>

      <group position={[-5.85, 2.1, -1.8]} rotation={[0, Math.PI / 2, 0]} name="portrait-frame-assembly">
        <PortraitWithFrame />
      </group>

      <group position={[5.85, 1.4, 0.5]} rotation={[0, -Math.PI / 2, 0]} name="whiteboard-mesh">
        
        <mesh castShadow receiveShadow>
          <boxGeometry args={[2.3, 1.6, 0.06]} />
          <meshStandardMaterial color="#3e2723" roughness={0.4} metalness={0.1} />
        </mesh>
        
        <mesh position={[0, 0, 0.031]}>
          <planeGeometry args={[2.2, 1.5]} />
          <meshStandardMaterial color="#c29b7c" roughness={0.9} metalness={0.05} />
        </mesh>

        <group position={[0, 0.35, 0.035]} name="investigation-map">
          <mesh castShadow>
            <planeGeometry args={[0.7, 0.5]} />
            <meshStandardMaterial color="#f7f1e3" roughness={0.8} />
          </mesh>
          <mesh position={[-0.1, 0.05, 0.002]} rotation={[0, 0, 0.3]}>
            <planeGeometry args={[0.55, 0.006]} />
            <meshBasicMaterial color="#d1c4a5" />
          </mesh>
          <mesh position={[0.1, -0.08, 0.002]} rotation={[0, 0, -0.55]}>
            <planeGeometry args={[0.55, 0.006]} />
            <meshBasicMaterial color="#d1c4a5" />
          </mesh>
          <mesh position={[0, 0.12, 0.002]} rotation={[0, 0, 0.1]}>
            <planeGeometry args={[0.62, 0.006]} />
            <meshBasicMaterial color="#d1c4a5" />
          </mesh>
          <mesh position={[-0.2, -0.1, 0.002]} rotation={[0, 0, 1.4]}>
            <planeGeometry args={[0.3, 0.006]} />
            <meshBasicMaterial color="#d1c4a5" />
          </mesh>
          <mesh position={[-0.1, 0.05, 0.004]}>
            <ringGeometry args={[0.045, 0.055, 16]} />
            <meshBasicMaterial color="#ff0000" />
          </mesh>
          <mesh position={[0.15, -0.05, 0.004]}>
            <ringGeometry args={[0.035, 0.045, 16]} />
            <meshBasicMaterial color="#ff0000" />
          </mesh>
          <mesh position={[0, 0.22, 0.006]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.012, 0.012, 0.04, 8]} />
            <meshStandardMaterial color="#00aaff" metalness={0.6} roughness={0.2} />
          </mesh>
        </group>

        <group position={[-0.7, 0.2, 0.035]} name="newspaper-clipping">
          <mesh castShadow>
            <planeGeometry args={[0.5, 0.6]} />
            <meshStandardMaterial color="#ebdcb9" roughness={0.75} />
          </mesh>
          <mesh position={[0, 0.24, 0.002]}>
            <planeGeometry args={[0.42, 0.06]} />
            <meshBasicMaterial color="#2c2c2c" />
          </mesh>
          <mesh position={[-0.11, -0.08, 0.002]}>
            <planeGeometry args={[0.18, 0.46]} />
            <meshBasicMaterial color="#7f7c6e" />
          </mesh>
          <mesh position={[0.11, -0.08, 0.002]}>
            <planeGeometry args={[0.18, 0.46]} />
            <meshBasicMaterial color="#7f7c6e" />
          </mesh>
          <mesh position={[0, 0.27, 0.006]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.012, 0.012, 0.04, 8]} />
            <meshStandardMaterial color="#ff0000" metalness={0.6} roughness={0.2} />
          </mesh>
        </group>

        <group position={[0.65, 0.32, 0.035]} name="missing-poster">
          <mesh castShadow>
            <planeGeometry args={[0.42, 0.54]} />
            <meshStandardMaterial color="#fafafa" roughness={0.6} />
          </mesh>
          <mesh position={[0, 0.21, 0.002]}>
            <planeGeometry args={[0.34, 0.06]} />
            <meshBasicMaterial color="#d32f2f" />
          </mesh>
          <group position={[0, 0.02, 0.002]}>
            <mesh>
              <planeGeometry args={[0.22, 0.22]} />
              <meshBasicMaterial color="#475569" />
            </mesh>
            <mesh position={[0, 0.02, 0.002]}>
              <circleGeometry args={[0.045, 16]} />
              <meshBasicMaterial color="#cbd5e1" />
            </mesh>
            <mesh position={[0, -0.04, 0.002]}>
              <ringGeometry args={[0, 0.07, 16, 1, 0, Math.PI]} />
              <meshBasicMaterial color="#cbd5e1" />
            </mesh>
          </group>
          <mesh position={[0, -0.16, 0.002]}>
            <planeGeometry args={[0.3, 0.08]} />
            <meshBasicMaterial color="#94a3b8" />
          </mesh>
          <mesh position={[0, 0.24, 0.006]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.012, 0.012, 0.04, 8]} />
            <meshStandardMaterial color="#00aa00" metalness={0.6} roughness={0.2} />
          </mesh>
        </group>

        <group position={[-0.6, -0.32, 0.035]} name="suspect-1">
          <mesh castShadow>
            <planeGeometry args={[0.28, 0.36]} />
            <meshStandardMaterial color="#ffffff" roughness={0.7} />
          </mesh>
          <group position={[0, 0.02, 0.002]}>
            <mesh><planeGeometry args={[0.24, 0.24]} /><meshBasicMaterial color="#334155" /></mesh>
            <mesh position={[0, 0.03, 0.002]}><circleGeometry args={[0.05, 16]} /><meshBasicMaterial color="#94a3b8" /></mesh>
            <mesh position={[0, -0.03, 0.002]}><ringGeometry args={[0, 0.08, 16, 1, 0, Math.PI]} /><meshBasicMaterial color="#94a3b8" /></mesh>
          </group>
          <mesh position={[0, 0.15, 0.006]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.012, 0.012, 0.04, 8]} />
            <meshStandardMaterial color="#ff0000" metalness={0.6} roughness={0.2} />
          </mesh>
        </group>

        <group position={[-0.1, -0.32, 0.035]} name="suspect-2">
          <mesh castShadow>
            <planeGeometry args={[0.28, 0.36]} />
            <meshStandardMaterial color="#ffffff" roughness={0.7} />
          </mesh>
          <group position={[0, 0.02, 0.002]}>
            <mesh><planeGeometry args={[0.24, 0.24]} /><meshBasicMaterial color="#334155" /></mesh>
            <mesh position={[0, 0.03, 0.002]}><circleGeometry args={[0.05, 16]} /><meshBasicMaterial color="#94a3b8" /></mesh>
            <mesh position={[0, -0.03, 0.002]}><ringGeometry args={[0, 0.08, 16, 1, 0, Math.PI]} /><meshBasicMaterial color="#94a3b8" /></mesh>
          </group>
          <group position={[0, 0.02, 0.008]}>
            <mesh rotation={[0, 0, Math.PI / 4]}><planeGeometry args={[0.22, 0.016]} /><meshBasicMaterial color="#d32f2f" /></mesh>
            <mesh rotation={[0, 0, -Math.PI / 4]}><planeGeometry args={[0.22, 0.016]} /><meshBasicMaterial color="#d32f2f" /></mesh>
          </group>
          <mesh position={[0, 0.15, 0.006]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.012, 0.012, 0.04, 8]} />
            <meshStandardMaterial color="#ff0000" metalness={0.6} roughness={0.2} />
          </mesh>
        </group>

        <group position={[0.4, -0.32, 0.035]} name="suspect-3">
          <mesh castShadow>
            <planeGeometry args={[0.28, 0.36]} />
            <meshStandardMaterial color="#ffffff" roughness={0.7} />
          </mesh>
          <group position={[0, 0.02, 0.002]}>
            <mesh><planeGeometry args={[0.24, 0.24]} /><meshBasicMaterial color="#334155" /></mesh>
            <mesh position={[0, 0.03, 0.002]}><circleGeometry args={[0.05, 16]} /><meshBasicMaterial color="#94a3b8" /></mesh>
            <mesh position={[0, -0.03, 0.002]}><ringGeometry args={[0, 0.08, 16, 1, 0, Math.PI]} /><meshBasicMaterial color="#94a3b8" /></mesh>
          </group>
          <mesh position={[0, 0.15, 0.006]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.012, 0.012, 0.04, 8]} />
            <meshStandardMaterial color="#ff0000" metalness={0.6} roughness={0.2} />
          </mesh>
        </group>

        <mesh position={[0.65, -0.12, 0.036]} rotation={[0, 0, 0.05]} castShadow>
          <planeGeometry args={[0.16, 0.16]} /><meshStandardMaterial color="#fef08a" roughness={0.8} />
        </mesh>
        <mesh position={[-0.38, 0.18, 0.036]} rotation={[0, 0, -0.08]} castShadow>
          <planeGeometry args={[0.16, 0.16]} /><meshStandardMaterial color="#86efac" roughness={0.8} />
        </mesh>
        <mesh position={[-0.8, -0.22, 0.036]} rotation={[0, 0, 0.12]} castShadow>
          <planeGeometry args={[0.16, 0.16]} /><meshStandardMaterial color="#f472b6" roughness={0.8} />
        </mesh>
        <mesh position={[0.38, 0.05, 0.036]} rotation={[0, 0, -0.04]} castShadow>
          <planeGeometry args={[0.16, 0.16]} /><meshStandardMaterial color="#67e8f9" roughness={0.8} />
        </mesh>

        <Line points={[[-0.7, 0.47, 0.042], [-0.6, -0.17, 0.042]]} color="#d32f2f" lineWidth={1.5} />
        <Line points={[[0.0, 0.57, 0.042], [-0.1, -0.17, 0.042]]} color="#d32f2f" lineWidth={1.5} />
        <Line points={[[0.65, 0.56, 0.042], [0.4, -0.17, 0.042]]} color="#d32f2f" lineWidth={1.5} />
        <Line points={[[-0.6, -0.17, 0.042], [-0.1, -0.17, 0.042]]} color="#d32f2f" lineWidth={1.5} />
        <Line points={[[-0.1, -0.17, 0.042], [0.4, -0.17, 0.042]]} color="#d32f2f" lineWidth={1.5} />
        <Line points={[[0.0, 0.57, 0.042], [-0.7, 0.47, 0.042]]} color="#d32f2f" lineWidth={1.5} />
        <Line points={[[0.0, 0.57, 0.042], [0.65, 0.56, 0.042]]} color="#d32f2f" lineWidth={1.5} />
      </group>

      <mesh position={[6, 1, 0]} rotation={[0, -Math.PI / 2, 0]} name="room-right-wall">
        <planeGeometry args={[10, 7]} />
        <meshStandardMaterial color={isNight ? '#141517' : '#f3f4f6'} roughness={0.9} metalness={0.15} />
      </mesh>

      <mesh position={[-6, 1, 0]} rotation={[0, Math.PI / 2, 0]} name="room-left-wall">
        <planeGeometry args={[10, 7]} />
        <meshStandardMaterial color={isNight ? '#141517' : '#f3f4f6'} roughness={0.9} metalness={0.15} />
      </mesh>


      <group position={[0, 4.3, 0]} name="ceiling-fan-group">
        <mesh castShadow position={[0, 0.3, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.6, 8]} />
          <meshStandardMaterial color="#050510" roughness={0.3} />
        </mesh>
        <mesh castShadow>
          <cylinderGeometry args={[0.4, 0.4, 0.15, 12]} />
          <meshStandardMaterial color={isNight ? '#090918' : '#475569'} roughness={0.2} />
        </mesh>
        <group ref={fanRef}>
          <mesh position={[1.2, 0, 0]}>
            <boxGeometry args={[1.8, 0.015, 0.2]} />
            <meshStandardMaterial color={isNight ? '#0b0c16' : '#64748b'} roughness={0.6} />
          </mesh>
          <mesh position={[-1.2, 0, 0]}>
            <boxGeometry args={[1.8, 0.015, 0.2]} />
            <meshStandardMaterial color={isNight ? '#0b0c16' : '#64748b'} roughness={0.6} />
          </mesh>
          <mesh position={[0, 0, 1.2]} rotation={[0, Math.PI / 2, 0]}>
            <boxGeometry args={[1.8, 0.015, 0.2]} />
            <meshStandardMaterial color={isNight ? '#0b0c16' : '#64748b'} roughness={0.6} />
          </mesh>
          <mesh position={[0, 0, -1.2]} rotation={[0, Math.PI / 2, 0]}>
            <boxGeometry args={[1.8, 0.015, 0.2]} />
            <meshStandardMaterial color={isNight ? '#0b0c16' : '#64748b'} roughness={0.6} />
          </mesh>
        </group>
      </group>

      <group position={[0, -1.2, -2.2]} name="desk-assembly">
        <mesh castShadow receiveShadow position={[0, 0, 0]} name="desk-top-surface">
          <boxGeometry args={[4.2, 0.12, 1.8]} />
          <meshPhysicalMaterial
            color={isNight ? '#0a0d1d' : '#f1f5f9'}
            transparent={true}
            opacity={0.35}
            roughness={0.05}
            metalness={0.1}
            transmission={0.85}
            thickness={0.4}
            ior={1.52}
            clearcoat={1.0}
            clearcoatRoughness={0.02}
          />
        </mesh>
        <mesh castShadow position={[-1.9, -0.66, 0]} name="desk-leg-l">
          <boxGeometry args={[0.15, 1.2, 1.4]} />
          <meshStandardMaterial color={isNight ? '#050510' : '#475569'} roughness={0.6} />
        </mesh>
        <mesh castShadow position={[1.9, -0.66, 0]} name="desk-leg-r">
          <boxGeometry args={[0.15, 1.2, 1.4]} />
          <meshStandardMaterial color={isNight ? '#050510' : '#475569'} roughness={0.6} />
        </mesh>

        <mesh position={[0, 0.015, 0.91]} name="desk-neon-trim">
          <boxGeometry args={[4.0, 0.03, 0.03]} />
          <meshBasicMaterial color={isNight ? '#ff007f' : '#00f0ff'} />
        </mesh>

        <group position={[-0.9, -0.6, 1.4]} rotation={[0, Math.PI, 0]} name="cyberspace-cockpit-chair">
          <mesh castShadow position={[0, -0.8, 0]}>
            <cylinderGeometry args={[0.6, 0.62, 0.06, 12]} />
            <meshStandardMaterial color="#0d0d1e" roughness={0.6} />
          </mesh>
          <mesh castShadow position={[0, -0.62, 0]}>
            <cylinderGeometry args={[0.1, 0.1, 0.36, 8]} />
            <meshStandardMaterial color="#050510" roughness={0.4} />
          </mesh>
          <mesh castShadow position={[0, -0.44, 0]}>
            <cylinderGeometry args={[0.14, 0.14, 0.08, 12]} />
            <meshStandardMaterial color="#2d2d38" metalness={0.7} roughness={0.3} />
          </mesh>
          <mesh castShadow position={[0, -0.38, 0]}>
            <cylinderGeometry args={[0.16, 0.16, 0.12, 12]} />
            <meshStandardMaterial color="#00f0ff" roughness={0.2} metalness={0.8} />
          </mesh>
          <mesh castShadow position={[0, -0.28, 0]}>
            <boxGeometry args={[1.0, 0.15, 0.95]} />
            <meshStandardMaterial color={isNight ? '#0a0a20' : '#e2e8f0'} roughness={0.5} />
          </mesh>
          <mesh castShadow position={[0, 0.42, -0.42]} rotation={[0.08, 0, 0]}>
            <boxGeometry args={[0.9, 1.2, 0.12]} />
            <meshStandardMaterial color={isNight ? '#040410' : '#cbd5e1'} roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.42, -0.49]}>
            <boxGeometry args={[0.8, 0.04, 0.04]} />
            <meshBasicMaterial color="#ff007f" />
          </mesh>
        </group>



        <group
          ref={mugRef}
          position={[-1.2, 0.08, 0.4]}
          name="coffee-mug-interactive"
          onClick={handleMugClick}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
        >
          <mesh castShadow position={[0, 0.11, 0]}>
            <cylinderGeometry args={[0.07, 0.07, 0.22, 16]} />
            <meshStandardMaterial
              color="#030312"
              roughness={0.1}
              metalness={0.8}
              emissive="#000000"
              emissiveIntensity={0.25}
            />
          </mesh>
          <mesh castShadow position={[-0.08, 0.11, 0]} rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[0.06, 0.018, 8, 16, Math.PI]} />
            <meshStandardMaterial color="#030312" roughness={0.1} />
          </mesh>
          <mesh position={[0, 0.21, 0]}>
            <cylinderGeometry args={[0.062, 0.062, 0.01, 12]} />
            <meshStandardMaterial color="#301508" roughness={0.9} />
          </mesh>
        </group>

        <group
          ref={lampRef}
          position={[1.5, 0.06, 0.3]}
          rotation={[0, -0.6, 0]}
          name="desk-lamp-interactive"
          onClick={handleLampClick}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
        >
          <mesh castShadow position={[0, 0.02, 0]}>
            <cylinderGeometry args={[0.18, 0.2, 0.04, 16]} />
            <meshStandardMaterial color="#0a0c16" roughness={0.2} metalness={0.9} />
          </mesh>
          <mesh castShadow position={[0, 0.05, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.04, 0.04, 0.08, 12]} />
            <meshStandardMaterial color="#222538" metalness={0.9} roughness={0.1} />
          </mesh>
          <mesh castShadow position={[0.06, 0.24, -0.06]} rotation={[0.25, 0, -0.15]}>
            <cylinderGeometry args={[0.016, 0.016, 0.42, 8]} />
            <meshStandardMaterial color="#1a1c32" roughness={0.4} metalness={0.8} />
          </mesh>
          <mesh castShadow position={[0.12, 0.44, -0.12]}>
            <sphereGeometry args={[0.04, 12, 12]} />
            <meshStandardMaterial color="#00f0ff" metalness={0.95} />
          </mesh>
          <mesh castShadow position={[0.02, 0.575, 0.01]} rotation={[-0.45, 0, 0.1]}>
            <cylinderGeometry args={[0.012, 0.012, 0.40, 8]} />
            <meshStandardMaterial color="#1a1c32" roughness={0.4} metalness={0.8} />
          </mesh>
          <mesh castShadow position={[-0.08, 0.71, 0.14]}>
            <sphereGeometry args={[0.03, 10, 10]} />
            <meshStandardMaterial color="#ff007f" />
          </mesh>
          <group position={[-0.1, 0.74, 0.16]} rotation={[0.45, 0, -0.1]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.14, 0.07, 0.18, 16]} />
              <meshStandardMaterial color="#0c0e18" roughness={0.3} metalness={0.8} />
            </mesh>
            <mesh position={[0, -0.07, 0]}>
              <sphereGeometry args={[0.048, 12, 12]} />
              <meshBasicMaterial
                color={lampIntensityState === 'bright' ? '#ffffff' : lampIntensityState === 'dim' ? '#ffa500' : '#222222'}
              />
            </mesh>
            {lampIntensityState !== 'off' && (
              <mesh position={[0, -0.45, 0]}>
                <coneGeometry args={[0.34, 0.8, 16, 1, true]} />
                <meshBasicMaterial
                  color={lampIntensityState === 'bright' ? '#00f0ff' : '#ffa500'}
                  transparent
                  opacity={lampIntensityState === 'bright' ? 0.08 : 0.05}
                  blending={THREE.AdditiveBlending}
                  side={THREE.DoubleSide}
                  depthWrite={false}
                />
              </mesh>
            )}
            {lampIntensityState !== 'off' && (
              <spotLight
                position={[0, -0.1, 0]}
                angle={Math.PI / 3}
                penumbra={0.8}
                intensity={lampIntensityState === 'bright' ? 5.0 : 1.8}
                color={lampIntensityState === 'bright' ? '#00f0ff' : '#ffa500'}
                castShadow
              />
            )}
            {lampIntensityState !== 'off' && (
              <pointLight
                position={[0, -0.15, 0]}
                intensity={lampIntensityState === 'bright' ? 2.5 : 1.0}
                distance={3.5}
                color={lampIntensityState === 'bright' ? '#00f0ff' : '#ffa500'}
              />
            )}
          </group>
        </group>
        
        <group position={[-0.5, 0.58, -0.2]} rotation={[0, Math.PI + 0.2, 0]} name="monitor-assembly">
          
          <mesh castShadow position={[0, -0.18, -0.06]}>
            <cylinderGeometry args={[0.045, 0.045, 0.68, 16]} />
            <meshStandardMaterial color="#1a1c24" roughness={0.3} metalness={0.93} />
          </mesh>
          <mesh position={[0, -0.49, -0.06]} castShadow>
            <boxGeometry args={[0.5, 0.035, 0.3]} />
            <meshStandardMaterial color="#0d0e14" roughness={0.2} metalness={0.95} />
          </mesh>
          <mesh position={[0, -0.54, -0.16]} castShadow>
            <boxGeometry args={[0.14, 0.14, 0.08]} />
            <meshStandardMaterial color="#07080c" roughness={0.5} metalness={0.88} />
          </mesh>
          
          <group position={[0, 0.12, 0.02]} name="monitor-panel-main">
            <mesh castShadow>
              <boxGeometry args={[1.2, 0.8, 0.06]} />
              <meshStandardMaterial color="#05050a" emissive="#020208" emissiveIntensity={0.2} />
            </mesh>
            <mesh position={[0, 0, 0.031]}>
              <planeGeometry args={[1.15, 0.75]} />
              <meshBasicMaterial color="#030310" />
            </mesh>
            <mesh position={[0, 0, 0.035]}>
              <planeGeometry args={[1.1, 0.7]} />
              <meshBasicMaterial color="#00f0ff" transparent opacity={0.15} blending={THREE.AdditiveBlending} />
            </mesh>
            
            <mesh position={[-0.2, 0.15, 0.040]}>
              <planeGeometry args={[0.3, 0.2]} />
              <meshBasicMaterial color="#ff007f" transparent opacity={0.6} />
            </mesh>
            <mesh position={[0.2, -0.1, 0.045]}>
              <planeGeometry args={[0.4, 0.3]} />
              <meshBasicMaterial color="#00f0ff" transparent opacity={0.4} />
            </mesh>
          </group>
        </group>

        <group position={[-1.0, 0.08, -0.1]} name="hologram-projector">
          <mesh castShadow position={[0, 0.01, 0]}>
            <cylinderGeometry args={[0.08, 0.09, 0.02, 16]} />
            <meshStandardMaterial color="#0a0a14" metalness={0.9} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.025, 0]}>
            <cylinderGeometry args={[0.06, 0.06, 0.01, 16]} />
            <meshBasicMaterial color="#00f0ff" />
          </mesh>
          <mesh ref={hologramRef} position={[0, 0.18, 0]}>
            <icosahedronGeometry args={[0.1, 1]} />
            <meshBasicMaterial color="#00f0ff" wireframe={true} transparent opacity={0.6} blending={THREE.AdditiveBlending} />
          </mesh>
          <pointLight position={[0, 0.1, 0]} distance={1.0} intensity={2.0} color="#00f0ff" />
        </group>

        <group position={[0.8, 0.08, -0.1]} rotation={[0, -0.4, 0]} name="laptop-mesh">
          <mesh castShadow position={[0, 0.01, 0]}>
            <boxGeometry args={[0.55, 0.02, 0.38]} />
            <meshStandardMaterial color="#0a0a14" roughness={0.4} metalness={0.9} />
          </mesh>
          <group position={[0, 0.01, -0.18]} rotation={[1.8, 0, 0]}>
            <mesh castShadow position={[0, 0.2, 0]}>
              <boxGeometry args={[0.55, 0.4, 0.02]} />
              <meshStandardMaterial color="#0a0a14" roughness={0.3} metalness={0.8} />
            </mesh>
            <mesh position={[0, 0.2, 0.011]}>
              <planeGeometry args={[0.51, 0.36]} />
              <meshBasicMaterial color="#05050a" />
            </mesh>
            <mesh position={[0, 0.2, 0.012]}>
              <planeGeometry args={[0.48, 0.32]} />
              <meshBasicMaterial color="#ff007f" transparent opacity={0.15} blending={THREE.AdditiveBlending} />
            </mesh>
          </group>
          <mesh position={[0, 0.021, 0.05]}>
            <planeGeometry args={[0.5, 0.22]} />
            <meshBasicMaterial color="#111" />
          </mesh>
          <mesh position={[0, 0.022, 0.05]}>
            <planeGeometry args={[0.46, 0.18]} />
            <meshBasicMaterial color="#ff007f" transparent opacity={0.2} blending={THREE.AdditiveBlending} />
          </mesh>
        </group>

        <group position={[-1.7, 0.08, 0.5]} name="workspace-plant">
          <mesh castShadow position={[0, 0.15, 0]}>
            <cylinderGeometry args={[0.22, 0.15, 0.3, 6]} />
            <meshStandardMaterial color="#090a16" roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.29, 0]}>
            <cylinderGeometry args={[0.2, 0.2, 0.02, 6]} />
            <meshStandardMaterial color="#020104" roughness={0.9} />
          </mesh>
          <group position={[0, 0.4, 0]}>
            <mesh castShadow position={[0, 0, 0]}>
              <boxGeometry args={[0.06, 0.4, 0.06]} />
              <meshStandardMaterial color="#1a6e2a" roughness={0.9} />
            </mesh>
            <mesh castShadow position={[0.07, 0.1, 0]} rotation={[0, 0, 0.5]}>
              <boxGeometry args={[0.05, 0.2, 0.05]} />
              <meshStandardMaterial color="#2d8e3d" roughness={0.9} />
            </mesh>
            <mesh castShadow position={[-0.07, -0.05, 0.06]} rotation={[0.4, 0, -0.6]}>
              <boxGeometry args={[0.05, 0.18, 0.05]} />
              <meshStandardMaterial color="#3eb051" roughness={0.9} />
            </mesh>
          </group>
        </group>

        <group 
          position={[-0.5, 0.06, -0.8]} 
          rotation={[0, Math.PI + 0.2, 0]} 
          name="keyboard-mouse"
          ref={keyboardRef}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
        >
          
          <group position={[-0.1, 0, 0]}>
            <mesh castShadow position={[0, 0.01, 0]} rotation={[0.05, 0, 0]}>
              <boxGeometry args={[0.82, 0.025, 0.26]} />
              <meshStandardMaterial color="#111218" roughness={0.7} />
            </mesh>
            
            <mesh position={[-0.12, 0.025, 0]} rotation={[0.05, 0, 0]}>
              <boxGeometry args={[0.54, 0.015, 0.22]} />
              <meshStandardMaterial color="#05050a" roughness={0.4} />
            </mesh>
            <mesh position={[-0.12, 0.025, 0]} rotation={[0.05, 0, 0]}>
              <boxGeometry args={[0.55, 0.01, 0.23]} />
              <meshStandardMaterial color="#00f0ff" emissive="#00f0ff" emissiveIntensity={0.5} />
            </mesh>
            
            <mesh position={[0.26, 0.025, 0]} rotation={[0.05, 0, 0]}>
              <boxGeometry args={[0.16, 0.015, 0.22]} />
              <meshStandardMaterial color="#05050a" roughness={0.4} />
            </mesh>
            <mesh position={[0.26, 0.025, 0]} rotation={[0.05, 0, 0]}>
              <boxGeometry args={[0.17, 0.01, 0.23]} />
              <meshStandardMaterial color="#00f0ff" emissive="#00f0ff" emissiveIntensity={0.5} />
            </mesh>
          </group>
          
          
          <group position={[0.6, 0.025, 0]}>
            <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
              <capsuleGeometry args={[0.045, 0.06, 8, 16]} />
              <meshStandardMaterial color="#080812" roughness={0.3} />
            </mesh>
            <mesh position={[0, 0.043, -0.04]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.012, 0.012, 0.018, 16]} />
              <meshStandardMaterial color="#00f0ff" roughness={0.2} metalness={0.8} />
            </mesh>
          </group>
        </group>

        <group position={[0.3, 0.06, 0.2]} rotation={[0, 0.4, 0]} name="energy-drink-1">
          <mesh castShadow position={[0, 0.08, 0]}>
            <cylinderGeometry args={[0.035, 0.035, 0.16, 16]} />
            <meshStandardMaterial color="#00f0ff" metalness={0.9} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.161, 0]}>
            <cylinderGeometry args={[0.032, 0.032, 0.005, 16]} />
            <meshStandardMaterial color="#cccccc" metalness={1.0} roughness={0.1} />
          </mesh>
        </group>

        <group position={[-1.2, 0.07, -0.1]} rotation={[Math.PI / 2 - 0.1, 0, 1.2]} name="energy-drink-2-crushed">
          <mesh castShadow position={[0, 0.08, 0]}>
            <cylinderGeometry args={[0.035, 0.032, 0.15, 8]} />
            <meshStandardMaterial color="#ff007f" metalness={0.8} roughness={0.4} />
          </mesh>
        </group>

        <group position={[-1.6, 0.12, -0.4]} name="water-can-assembly"
          ref={waterCanRef}
          onPointerDown={handleWaterCanClick}
        >
          <mesh castShadow position={[0, 0.15, 0]}>
            <cylinderGeometry args={[0.12, 0.12, 0.3, 16]} />
            <meshStandardMaterial color="#1a1c24" roughness={0.3} metalness={0.8} />
          </mesh>
          <mesh position={[0, 0.15, 0.125]}>
            <planeGeometry args={[0.15, 0.2]} />
            <meshBasicMaterial color="#00f0ff" />
          </mesh>
          <mesh castShadow position={[0, 0.32, 0]}>
            <cylinderGeometry args={[0.04, 0.12, 0.06, 16]} />
            <meshStandardMaterial color="#00f0ff" roughness={0.2} metalness={0.9} />
          </mesh>
          <mesh castShadow position={[0.14, 0.15, 0]} rotation={[0, 0, -0.2]}>
            <torusGeometry args={[0.08, 0.02, 8, 16, Math.PI]} />
            <meshStandardMaterial color="#1a1c24" roughness={0.3} metalness={0.8} />
          </mesh>
          <mesh castShadow position={[-0.15, 0.25, 0]} rotation={[0, 0, 0.6]}>
            <cylinderGeometry args={[0.015, 0.02, 0.2, 8]} />
            <meshStandardMaterial color="#ff007f" roughness={0.2} metalness={0.8} />
          </mesh>
          <group ref={waterDropsRef} name="water-drops-system">
            <mesh><boxGeometry args={[0.01, 0.01, 0.01]} /><meshBasicMaterial color="#00f0ff" /></mesh>
            <mesh><boxGeometry args={[0.01, 0.01, 0.01]} /><meshBasicMaterial color="#ff007f" /></mesh>
            <mesh><boxGeometry args={[0.01, 0.01, 0.01]} /><meshBasicMaterial color="#00f0ff" /></mesh>
            <mesh><boxGeometry args={[0.01, 0.01, 0.01]} /><meshBasicMaterial color="#ff007f" /></mesh>
            <mesh><boxGeometry args={[0.01, 0.01, 0.01]} /><meshBasicMaterial color="#00f0ff" /></mesh>
            <mesh><boxGeometry args={[0.01, 0.01, 0.01]} /><meshBasicMaterial color="#ff007f" /></mesh>
            <mesh><boxGeometry args={[0.01, 0.01, 0.01]} /><meshBasicMaterial color="#00f0ff" /></mesh>
            <mesh><boxGeometry args={[0.01, 0.01, 0.01]} /><meshBasicMaterial color="#ff007f" /></mesh>
          </group>
        </group>

        <group position={[1.2, 0.08, 0.1]} rotation={[0, -0.6, 0]}>
          <mesh castShadow position={[0, 0.05, 0]}>
            <cylinderGeometry args={[0.12, 0.15, 0.1, 16]} />
            <meshStandardMaterial color="#090a14" roughness={0.4} />
          </mesh>
          <mesh position={[0.01, 0.033, 0.03]} rotation={[0, -0.15, 0]}>
            <planeGeometry args={[0.12, 0.08]} />
            <meshBasicMaterial color="#ff007f" />
          </mesh>
          <mesh position={[-0.04, 0.026, -0.05]}>
            <boxGeometry args={[0.04, 0.02, 0.03]} />
            <meshStandardMaterial color="#00f0ff" metalness={0.9} />
          </mesh>
        </group>

        <group position={[0.9, -0.6, 1.4]} rotation={[0, Math.PI, 0]} name="front-chair-2">
          <mesh castShadow position={[0, -0.8, 0]}>
            <cylinderGeometry args={[0.6, 0.62, 0.06, 12]} />
            <meshStandardMaterial color="#0d0d1e" roughness={0.6} />
          </mesh>
          <mesh castShadow position={[0, -0.62, 0]}>
            <cylinderGeometry args={[0.1, 0.1, 0.36, 8]} />
            <meshStandardMaterial color="#050510" roughness={0.4} />
          </mesh>
          <mesh castShadow position={[0, -0.44, 0]}>
            <cylinderGeometry args={[0.14, 0.14, 0.08, 12]} />
            <meshStandardMaterial color="#2d2d38" metalness={0.7} roughness={0.3} />
          </mesh>
          <mesh castShadow position={[0, -0.38, 0]}>
            <cylinderGeometry args={[0.16, 0.16, 0.12, 12]} />
            <meshStandardMaterial color="#00f0ff" roughness={0.2} metalness={0.8} />
          </mesh>
          <mesh castShadow position={[0, -0.28, 0]}>
            <boxGeometry args={[1.0, 0.15, 0.95]} />
            <meshStandardMaterial color={isNight ? '#0a0a20' : '#e2e8f0'} roughness={0.5} />
          </mesh>
          <mesh castShadow position={[0, 0.42, -0.42]} rotation={[0.08, 0, 0]}>
            <boxGeometry args={[0.9, 1.2, 0.12]} />
            <meshStandardMaterial color={isNight ? '#040410' : '#cbd5e1'} roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.42, -0.49]}>
            <boxGeometry args={[0.8, 0.04, 0.04]} />
            <meshBasicMaterial color="#00f0ff" />
          </mesh>
        </group>

        <group
          position={[0, -0.6, -1.7]}
          rotation={[0, 0, 0]}
          name="back-chair-1"
          onPointerDown={(e) => {
            e.stopPropagation();
            isDraggingChair.current = true;
            prevPointerX.current = e.pointer.x;
            if (e.target && (e.target as any).setPointerCapture) {
              (e.target as any).setPointerCapture(e.pointerId);
            }
            onChairDragChange?.(true);
          }}
          onPointerMove={(e) => {
            if (isDraggingChair.current) {
              e.stopPropagation();
              const deltaX = e.pointer.x - prevPointerX.current;
              setChairRot((prev) => {
                const next = prev - deltaX * 3.5;
                return Math.max(-2.2, Math.min(2.2, next));
              });
              prevPointerX.current = e.pointer.x;
            }
          }}
          onPointerUp={(e) => {
            if (isDraggingChair.current) {
              e.stopPropagation();
              isDraggingChair.current = false;
              if (e.target && (e.target as any).releasePointerCapture) {
                (e.target as any).releasePointerCapture(e.pointerId);
              }

              onChairDragChange?.(false);
            }
          }}
          onPointerOver={handlePointerOver}
          onPointerOut={() => {
            handlePointerOut();
            if (isDraggingChair.current) {
              isDraggingChair.current = false;
              onChairDragChange?.(false);
            }
          }}
        >
          <group name="chair-static-base">
            <mesh castShadow position={[0, -0.8, 0]}>
              <cylinderGeometry args={[0.6, 0.62, 0.06, 12]} />
              <meshStandardMaterial color="#0d0d1e" roughness={0.6} />
            </mesh>
            <mesh castShadow position={[0, -0.62, 0]}>
              <cylinderGeometry args={[0.1, 0.1, 0.36, 8]} />
              <meshStandardMaterial color="#050510" roughness={0.4} />
            </mesh>
            <mesh castShadow position={[0, -0.44, 0]}>
              <cylinderGeometry args={[0.14, 0.14, 0.08, 12]} />
              <meshStandardMaterial color="#2d2d38" metalness={0.7} roughness={0.3} />
            </mesh>
          </group>

          <group ref={chairRef} name="chair-rotating-upper">

            <mesh castShadow position={[0, -0.38, 0]}>
              <cylinderGeometry args={[0.16, 0.16, 0.12, 12]} />
              <meshStandardMaterial color="#ff007f" roughness={0.2} metalness={0.8} />
            </mesh>
            

            <mesh castShadow position={[0, -0.26, 0]}>
              <boxGeometry args={[0.95, 0.18, 0.85]} />
              <meshStandardMaterial color="#ff007f" roughness={0.4} emissive="#ff007f" emissiveIntensity={0.1} />
            </mesh>
            

            <mesh castShadow position={[0, 0.5, -0.38]} rotation={[0.12, 0, 0]}>
              <boxGeometry args={[0.8, 1.4, 0.15]} />
              <meshStandardMaterial color={isNight ? '#040410' : '#cbd5e1'} roughness={0.3} />
            </mesh>
            

            <mesh position={[0, 0.5, -0.46]} rotation={[0.12, 0, 0]}>
              <boxGeometry args={[0.1, 1.3, 0.04]} />
              <meshBasicMaterial color="#ff007f" />
            </mesh>
            

            <mesh castShadow position={[-0.38, 0.5, -0.32]} rotation={[0.12, -0.15, 0]}>
              <boxGeometry args={[0.15, 1.35, 0.2]} />
              <meshStandardMaterial color="#ff007f" roughness={0.4} emissive="#ff007f" emissiveIntensity={0.1} />
            </mesh>
            

            <mesh castShadow position={[0.38, 0.5, -0.32]} rotation={[0.12, 0.15, 0]}>
              <boxGeometry args={[0.15, 1.35, 0.2]} />
              <meshStandardMaterial color="#ff007f" roughness={0.4} emissive="#ff007f" emissiveIntensity={0.1} />
            </mesh>
            

            <mesh castShadow position={[0, 1.25, -0.3]} rotation={[0.12, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.15, 0.15, 0.5, 12]} />
              <meshStandardMaterial color={isNight ? '#0a0a20' : '#e2e8f0'} roughness={0.6} />
            </mesh>
            

            <mesh castShadow position={[-0.45, 0.05, 0.1]}>
              <boxGeometry args={[0.04, 0.45, 0.06]} />
              <meshStandardMaterial color="#2d2d38" metalness={0.6} roughness={0.4} />
            </mesh>
            <mesh castShadow position={[-0.45, 0.28, 0.1]}>
              <boxGeometry args={[0.1, 0.04, 0.4]} />
              <meshStandardMaterial color={isNight ? '#050510' : '#94a3b8'} roughness={0.5} />
            </mesh>
            <mesh castShadow position={[0.45, 0.05, 0.1]}>
              <boxGeometry args={[0.04, 0.45, 0.06]} />
              <meshStandardMaterial color="#2d2d38" metalness={0.6} roughness={0.4} />
            </mesh>
            <mesh castShadow position={[0.45, 0.28, 0.1]}>
              <boxGeometry args={[0.1, 0.04, 0.4]} />
              <meshStandardMaterial color={isNight ? '#050510' : '#94a3b8'} roughness={0.5} />
            </mesh>
          </group>
        </group>
      </group>

      <group position={[4.2, -0.9, -3.4]} rotation={[0, -0.25, 0]} name="bookshelf-assembly">
        <mesh castShadow position={[-1.0, 0.8, 0]}>
            <boxGeometry args={[0.08, 3.2, 0.7]} />
            <meshStandardMaterial color="#050510" roughness={0.4} />
          </mesh>
          <mesh castShadow position={[1.0, 0.8, 0]}>
            <boxGeometry args={[0.08, 3.2, 0.7]} />
            <meshStandardMaterial color="#050510" roughness={0.4} />
          </mesh>
          <mesh castShadow receiveShadow position={[0, 0.1, 0]}>
            <boxGeometry args={[2.0, 0.08, 0.65]} />
            <meshStandardMaterial color="#050510" roughness={0.3} metalness={0.7} />
          </mesh>
          <mesh position={[0, 0.1, 0.33]}>
            <boxGeometry args={[1.9, 0.02, 0.02]} />
            <meshBasicMaterial color="#00f0ff" />
          </mesh>
          <group position={[0, 0.45, -0.05]}>
            <mesh castShadow position={[-0.7, 0, 0]} rotation={[0, 0.04, 0]}>
              <boxGeometry args={[0.13, 0.58, 0.45]} />
              <meshStandardMaterial color="#00f0ff" roughness={0.2} emissive="#00f0ff" emissiveIntensity={0.15} />
            </mesh>
            <mesh castShadow position={[-0.52, 0, 0.01]} rotation={[0, -0.06, 0]}>
              <boxGeometry args={[0.14, 0.65, 0.42]} />
              <meshStandardMaterial color="#ff007f" roughness={0.2} emissive="#ff007f" emissiveIntensity={0.1} />
            </mesh>
            <mesh castShadow position={[-0.32, -0.05, 0]} rotation={[0, 0, -0.28]}>
              <boxGeometry args={[0.12, 0.54, 0.45]} />
              <meshStandardMaterial color="#421a68" roughness={0.6} />
            </mesh>
            <mesh castShadow position={[0.4, -0.15, 0]}>
              <boxGeometry args={[0.3, 0.3, 0.3]} />
              <meshStandardMaterial color="#141428" roughness={0.1} metalness={0.9} />
            </mesh>
            <mesh castShadow position={[0.8, -0.25, 0]} rotation={[0, 0.2, 0]}>
              <boxGeometry args={[0.4, 0.08, 0.5]} />
              <meshStandardMaterial color="#00f0ff" roughness={0.3} emissive="#00f0ff" emissiveIntensity={0.05} />
            </mesh>
            <mesh castShadow position={[0.8, -0.15, 0]} rotation={[0, -0.1, 0]}>
              <boxGeometry args={[0.38, 0.08, 0.48]} />
              <meshStandardMaterial color="#333344" roughness={0.7} />
            </mesh>
            <mesh castShadow position={[0.8, -0.05, 0]} rotation={[0, 0.05, 0]}>
              <boxGeometry args={[0.35, 0.08, 0.45]} />
              <meshStandardMaterial color="#ff007f" roughness={0.4} />
            </mesh>
          </group>
          <mesh castShadow receiveShadow position={[0, 1.1, 0]}>
            <boxGeometry args={[2.0, 0.08, 0.65]} />
            <meshStandardMaterial color="#050510" roughness={0.3} metalness={0.7} />
          </mesh>
          <mesh position={[0, 1.1, 0.33]}>
            <boxGeometry args={[1.9, 0.02, 0.02]} />
            <meshBasicMaterial color="#00f0ff" />
          </mesh>
          <group position={[0, 1.42, -0.05]}>
            <mesh castShadow position={[0.6, 0, 0.02]}>
              <boxGeometry args={[0.3, 0.52, 0.48]} />
              <meshStandardMaterial color="#1a1c31" roughness={0.5} />
            </mesh>
            <mesh castShadow position={[-0.2, 0, 0]} rotation={[0, 0.1, 0.15]}>
              <boxGeometry args={[0.11, 0.52, 0.42]} />
              <meshStandardMaterial color="#00f0ff" roughness={0.3} />
            </mesh>
            <mesh castShadow position={[-0.6, -0.12, 0]} rotation={[0, 0.3, 0]}>
              <boxGeometry args={[0.24, 0.24, 0.24]} />
              <meshStandardMaterial color="#ff007f" roughness={0.1} emissive="#ff007f" emissiveIntensity={0.2} />
            </mesh>
            <pointLight position={[-0.6, -0.12, 0.2]} color="#ff007f" intensity={1.0} distance={1.2} />
            
            <mesh castShadow position={[-0.9, -0.05, 0]} rotation={[0, -0.2, 0]}>
              <boxGeometry args={[0.08, 0.4, 0.45]} />
              <meshStandardMaterial color="#ff007f" roughness={0.5} emissive="#ff007f" emissiveIntensity={0.1} />
            </mesh>
            <mesh castShadow position={[0.2, 0.05, 0]}>
              <boxGeometry args={[0.08, 0.6, 0.5]} />
              <meshStandardMaterial color="#2d2d38" metalness={0.5} roughness={0.5} />
            </mesh>
            <mesh castShadow position={[0.3, -0.05, 0]} rotation={[0, 0, 0.1]}>
              <boxGeometry args={[0.08, 0.4, 0.48]} />
              <meshStandardMaterial color="#00f0ff" roughness={0.5} />
            </mesh>

            <group position={[0.2, -0.21, 0.12]} rotation={[0, -0.4, 0]}>
              <mesh castShadow position={[0, 0.01, 0]}>
                <cylinderGeometry args={[0.10, 0.12, 0.02, 8]} />
                <meshStandardMaterial color="#0b0d1a" roughness={0.1} metalness={0.9} />
              </mesh>
              <mesh castShadow position={[-0.03, 0.06, 0]}>
                <boxGeometry args={[0.025, 0.08, 0.025]} />
                <meshStandardMaterial color="#1e1b38" metalness={0.8} />
              </mesh>
              <mesh castShadow position={[0.03, 0.06, 0]}>
                <boxGeometry args={[0.025, 0.08, 0.025]} />
                <meshStandardMaterial color="#1e1b38" metalness={0.8} />
              </mesh>
              <mesh castShadow position={[0, 0.16, 0]}>
                <boxGeometry args={[0.11, 0.12, 0.08]} />
                <meshStandardMaterial color="#0e111d" roughness={0.3} metalness={0.7} />
              </mesh>
              <mesh position={[0, 0.16, 0.041]}>
                <planeGeometry args={[0.04, 0.04]} />
                <meshBasicMaterial color="#00f0ff" />
              </mesh>
              <mesh castShadow position={[0, 0.25, 0]}>
                <boxGeometry args={[0.06, 0.06, 0.06]} />
                <meshStandardMaterial color="#1f1f38" metalness={0.9} />
              </mesh>
              <mesh position={[0, 0.26, 0.031]}>
                <planeGeometry args={[0.04, 0.01]} />
                <meshBasicMaterial color="#ff007f" />
              </mesh>
              <mesh castShadow position={[-0.07, 0.18, 0]} rotation={[0, 0, 0.3]}>
                <boxGeometry args={[0.03, 0.07, 0.06]} />
                <meshStandardMaterial color="#00f0ff" />
              </mesh>
              <mesh castShadow position={[0.07, 0.18, 0]} rotation={[0, 0, -0.3]}>
                <boxGeometry args={[0.03, 0.07, 0.06]} />
                <meshStandardMaterial color="#00f0ff" />
              </mesh>
            </group>
          </group>
          <mesh castShadow receiveShadow position={[0, 2.1, 0]}>
            <boxGeometry args={[2.0, 0.08, 0.65]} />
            <meshStandardMaterial color="#050510" roughness={0.3} metalness={0.7} />
          </mesh>
        </group>
      </group>

  );
}
