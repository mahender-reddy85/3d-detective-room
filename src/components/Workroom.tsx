/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useRef, useState, useMemo } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { SceneSection } from '../types';
import Skyline from './Skyline';

interface WorkroomProps {
  currentSection: SceneSection;
  onSelectSection: (section: SceneSection) => void;
  isNight: boolean;
  onChairDragChange?: (isDragging: boolean) => void;
}

export default function Workroom({
  currentSection,
  onSelectSection,
  isNight,
  onChairDragChange,
}: WorkroomProps) {
  const fanRef = useRef<THREE.Group>(null);
  const mugRef = useRef<THREE.Group>(null);
  const lampRef = useRef<THREE.Group>(null);
  const keyboardRef = useRef<THREE.Group>(null);
  const waterCanRef = useRef<THREE.Group>(null);
  const waterDropsRef = useRef<THREE.Group>(null);
  
  // Hover states to control emissive neon highlights
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // States for interactive mug, lamp and water can accessories
  const [lampIntensityState, setLampIntensityState] = useState<'off' | 'dim' | 'bright'>('bright');
  const [mugTargetRot, setMugTargetRot] = useState(0);
  const [isWatering, setIsWatering] = useState(false);
  const [wateringStatusText, setWateringStatusText] = useState('STANDBY');

  // Chair rotation controls
  const [chairRot, setChairRot] = useState(-0.05);
  const isDraggingChair = useRef(false);
  const prevPointerX = useRef(0);
  const chairRef = useRef<THREE.Group>(null);

  // Rotate fan blades and float dust particles in a lifelike sway
  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();

    // Fan rotation
    if (fanRef.current) {
      fanRef.current.rotation.y = t * 1.8;
    }

    // Smooth lerp mug rotation on hover/activation
    if (mugRef.current) {
      mugRef.current.rotation.y = THREE.MathUtils.lerp(mugRef.current.rotation.y, mugTargetRot, 5 * delta);
    }

    // Smooth lerp chair rotation from user dragging/pivoting
    if (chairRef.current) {
      chairRef.current.rotation.y = THREE.MathUtils.lerp(chairRef.current.rotation.y, chairRot, 6 * delta);
    }

    // Smooth tilt and nod on lamp base/head if hovered
    if (lampRef.current) {
      const targetRotY = hoveredNode === 'lamp' ? -0.4 : -0.6;
      const targetRotZ = hoveredNode === 'lamp' ? 0.08 : 0;
      lampRef.current.rotation.y = THREE.MathUtils.lerp(lampRef.current.rotation.y, targetRotY, 8 * delta);
      lampRef.current.rotation.z = THREE.MathUtils.lerp(lampRef.current.rotation.z, targetRotZ, 8 * delta);
    }

    // Smooth bobbing and lift on keyboard when hovered
    if (keyboardRef.current) {
      const targetY = hoveredNode === 'keyboard' ? 0.12 : 0.08;
      const targetScale = hoveredNode === 'keyboard' ? 1.05 : 1.0;
      keyboardRef.current.position.y = THREE.MathUtils.lerp(keyboardRef.current.position.y, targetY, 8 * delta);
      keyboardRef.current.scale.setScalar(THREE.MathUtils.lerp(keyboardRef.current.scale.x, targetScale, 10 * delta));
    }

    // Smooth watering can tilt
    if (waterCanRef.current) {
      const targetTiltZ = isWatering ? -0.85 : (hoveredNode === 'water_can' ? -0.15 : 0);
      const targetTiltX = isWatering ? 0.35 : 0;
      const targetY = isWatering ? 0.22 : 0.08;
      waterCanRef.current.rotation.z = THREE.MathUtils.lerp(waterCanRef.current.rotation.z, targetTiltZ, 8 * delta);
      waterCanRef.current.rotation.x = THREE.MathUtils.lerp(waterCanRef.current.rotation.x, targetTiltX, 8 * delta);
      waterCanRef.current.position.y = THREE.MathUtils.lerp(waterCanRef.current.position.y, targetY, 8 * delta);
    }

    // Animate watering flow droplets reaching the plant root
    if (waterDropsRef.current) {
      const children = waterDropsRef.current.children;
      children.forEach((child, i) => {
        if (!isWatering) {
          child.scale.setScalar(0);
          child.position.set(-0.35, 0.26, 0.0);
        } else {
          child.scale.setScalar(1);
          // Flow cycle
          const cycle = (t * 2.5 + i * 0.4) % 1.0;
          
          const startX = -0.35;
          const startY = 0.26;
          const startZ = 0.0;
          
          const endX = -0.7;
          const endY = -0.05;
          const endZ = -0.15;
          
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

  const handlePointerOver = (nodeId: string) => {
    setHoveredNode(nodeId);
    document.body.style.cursor = 'pointer';
    if (window.playGlitchBeep) {
      window.playGlitchBeep('beep');
    }
  };

  const handlePointerOut = () => {
    setHoveredNode(null);
    document.body.style.cursor = 'auto';
  };

  const handleClickSection = (section: SceneSection, e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onSelectSection(section);
    if (window.playGlitchBeep) {
      window.playGlitchBeep('chord');
    }
  };

  const handleMugClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    setMugTargetRot((prev) => prev + Math.PI * 2);
    if (window.playGlitchBeep) {
      window.playGlitchBeep('laser');
    }
  };

  const handleLampClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    setLampIntensityState((prev) => {
      const next = prev === 'bright' ? 'off' : prev === 'off' ? 'dim' : 'bright';
      if (window.playGlitchBeep) {
        window.playGlitchBeep(next === 'off' ? 'static' : 'beep');
      }
      return next;
    });
  };

  const handleWaterCanClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (isWatering) return;
    setIsWatering(true);
    setWateringStatusText('INJECTING...');
    if (window.playGlitchBeep) {
      window.playGlitchBeep('laser');
    }
    setTimeout(() => {
      setWateringStatusText('WASHING CACHE...');
      if (window.playGlitchBeep) {
        window.playGlitchBeep('beep');
      }
    }, 1200);
    setTimeout(() => {
      setWateringStatusText('RAM BOOS-TED!!');
      if (window.playGlitchBeep) {
        window.playGlitchBeep('chord');
      }
    }, 2400);
    setTimeout(() => {
      setIsWatering(false);
      setWateringStatusText('STANDBY');
    }, 3800);
  };

  // Pulse value for neon strips
  const ledIntensity = 1.0 + Math.sin(Date.now() / 300) * 0.2;

  return (
    <group name="workroom-assembly">
      {/* City Skyline Panel Placement behind the Window Frame */}
      <group position={[0, 1.2, -4.95]} name="skyline-window-housing">
        <Skyline isNight={isNight} />
      </group>

      {/* Solid Walls & Floors Structure */}
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.5, 0]} receiveShadow name="room-floor">
        <planeGeometry args={[12, 10]} />
        <meshStandardMaterial
          color={isNight ? '#0b0c14' : '#e5e7eb'}
          roughness={0.8}
          metalness={0.05}
        />
      </mesh>

      {/* Ceiling with Fan Center */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 4.5, 0]} receiveShadow name="room-ceiling">
        <planeGeometry args={[12, 10]} />
        <meshStandardMaterial color={isNight ? '#080911' : '#f9fafb'} roughness={0.95} />
      </mesh>

      {/* Back Wall equipped with Window Aperture */}
      <mesh position={[0, 1, -5]} receiveShadow name="room-backwall">
        <boxGeometry args={[12, 7, 0.1]} />
        <meshStandardMaterial color={isNight ? '#06070c' : '#f3f4f6'} roughness={0.95} metalness={0.05} />
      </mesh>

      {/* Window Frame Inner Border Cuts */}
      <group position={[0, 1.2, -4.9]} name="room-window-frame">
        {/* Frame borders */}
        <mesh position={[0, 1.55, 0]}>
          <boxGeometry args={[4.2, 0.1, 0.2]} />
          <meshStandardMaterial color={isNight ? '#0a0a14' : '#64748b'} roughness={0.6} />
        </mesh>
        <mesh position={[0, -1.55, 0]}>
          <boxGeometry args={[4.2, 0.1, 0.2]} />
          <meshStandardMaterial color={isNight ? '#0a0a14' : '#64748b'} roughness={0.6} />
        </mesh>
        <mesh position={[-2.1, 0, 0]}>
          <boxGeometry args={[0.1, 3.2, 0.2]} />
          <meshStandardMaterial color={isNight ? '#0a0a14' : '#64748b'} roughness={0.6} />
        </mesh>
        <mesh position={[2.1, 0, 0]}>
          <boxGeometry args={[0.1, 3.2, 0.2]} />
          <meshStandardMaterial color={isNight ? '#0a0a14' : '#64748b'} roughness={0.6} />
        </mesh>
        {/* Thin emission glow around window glass */}
        <mesh position={[0, 0, -0.05]}>
          <planeGeometry args={[4.0, 3.0]} />
          <meshBasicMaterial
            color={isNight ? '#ff007f' : '#00f0ff'}
            transparent
            opacity={isNight ? 0.08 : 0.14}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </group>

      {/* Right Wall */}
      <mesh position={[6, 1, 0]} rotation={[0, -Math.PI / 2, 0]} name="room-right-wall">
        <planeGeometry args={[10, 7]} />
        <meshStandardMaterial color={isNight ? '#06070c' : '#f3f4f6'} roughness={0.95} metalness={0.0} />
      </mesh>

      {/* Left Wall */}
      <mesh position={[-6, 1, 0]} rotation={[0, Math.PI / 2, 0]} name="room-left-wall">
        <planeGeometry args={[10, 7]} />
        <meshStandardMaterial color={isNight ? '#06070c' : '#f3f4f6'} roughness={0.95} metalness={0.0} />
      </mesh>

      {/* LED Neon Lighting Strip on Walls */}
      <group position={[-5.9, 2.5, 0]} rotation={[0, Math.PI / 2, 0]} name="wall-neon-strip">
        <mesh>
          <boxGeometry args={[8, 0.05, 0.05]} />
          <meshBasicMaterial color="#00f0ff" />
        </mesh>
        <pointLight color="#00f0ff" intensity={1.5} distance={5} />
      </group>

      <group position={[5.9, 2.5, 0]} rotation={[0, -Math.PI / 2, 0]} name="wall-neon-strip-right">
        <mesh>
          <boxGeometry args={[8, 0.05, 0.05]} />
          <meshBasicMaterial color="#ff007f" />
        </mesh>
        <pointLight color="#ff007f" intensity={1.5} distance={5} />
      </group>

      {/* INTERACTIVE DRY-ERASE WHITEBOARD ON LEFT WALL (Controls Contact Section) */}
      <group
        position={[-5.82, 1.0, -1.8]}
        rotation={[0, Math.PI / 2, 0]}
        name="poster-interactive-mesh"
        onPointerOver={() => handlePointerOver('poster')}
        onPointerOut={handlePointerOut}
        onClick={(e) => handleClickSection('CONTACT', e)}
      >
        {/* Whiteboard Outer Tech Metal/Alcan Frame */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[2.3, 1.6, 0.06]} />
          <meshStandardMaterial
            color={hoveredNode === 'poster' || currentSection === 'CONTACT' ? '#ff007f' : '#222533'}
            roughness={0.25}
            metalness={0.85}
            emissive={hoveredNode === 'poster' || currentSection === 'CONTACT' ? '#ff007f' : '#000000'}
            emissiveIntensity={0.2}
          />
        </mesh>
        
        {/* Deep Glossy Whiteboard Surface Sheet */}
        <mesh position={[0, 0, 0.015]}>
          <planeGeometry args={[2.2, 1.5]} />
          <meshStandardMaterial 
            color="#fafafa" 
            roughness={0.08} 
            metalness={0.05} 
          />
        </mesh>

        {/* Dynamic Dry-erase Hand-drawn Cyber Flowchart Diagrams */}
        {/* Hub Node 1 (Blue marker) */}
        <mesh position={[0.2, 0.15, 0.017]}>
          <ringGeometry args={[0.13, 0.15, 16]} />
          <meshBasicMaterial color="#0088cc" />
        </mesh>
        {/* Hub Node 2 (Pink marker) */}
        <mesh position={[-0.3, -0.15, 0.017]}>
          <ringGeometry args={[0.10, 0.12, 16]} />
          <meshBasicMaterial color="#ff007f" />
        </mesh>
        {/* Data processing stack box */}
        <mesh position={[0.2, -0.3, 0.017]}>
          <planeGeometry args={[0.26, 0.14]} />
          <meshBasicMaterial color="#ff007f" transparent opacity={0.15} />
        </mesh>
        <mesh position={[0.2, -0.3, 0.018]} rotation={[0, 0, Math.PI / 4]}>
          <ringGeometry args={[0.13, 0.14, 4]} />
          <meshBasicMaterial color="#ff007f" />
        </mesh>
        {/* Connecting vector lines */}
        <mesh position={[-0.05, 0.0, 0.017]} rotation={[0, 0, -0.55]}>
          <planeGeometry args={[0.42, 0.01]} />
          <meshBasicMaterial color="#1e293b" />
        </mesh>
        <mesh position={[0.2, -0.08, 0.017]} rotation={[0, 0, -1.57]}>
          <planeGeometry args={[0.25, 0.01]} />
          <meshBasicMaterial color="#1e293b" />
        </mesh>

        {/* Mock handwritten scribble text blocks */}
        <mesh position={[-0.7, 0.35, 0.017]}>
          <planeGeometry args={[0.35, 0.012]} />
          <meshBasicMaterial color="#2d3748" />
        </mesh>
        <mesh position={[-0.72, 0.29, 0.017]}>
          <planeGeometry args={[0.3, 0.012]} />
          <meshBasicMaterial color="#2d3748" />
        </mesh>
        <mesh position={[-0.67, 0.23, 0.017]}>
          <planeGeometry args={[0.4, 0.012]} />
          <meshBasicMaterial color="#ff007f" />
        </mesh>

        {/* Colorful physical post-it notes stuck to board surface */}
        <mesh position={[-0.8, -0.2, 0.018]} rotation={[0, 0, 0.08]} castShadow>
          <planeGeometry args={[0.24, 0.24]} />
          <meshStandardMaterial color="#fef08a" roughness={0.8} /> {/* Yellow stickie */}
        </mesh>
        {/* Floating sticky shadow look line */}
        <mesh position={[-0.82, -0.22, 0.019]}>
          <planeGeometry args={[0.22, 0.02]} />
          <meshBasicMaterial color="#334155" transparent opacity={0.18} />
        </mesh>

        <mesh position={[0.8, 0.4, 0.018]} rotation={[0, 0, -0.05]} castShadow>
          <planeGeometry args={[0.24, 0.24]} />
          <meshStandardMaterial color="#67e8f9" roughness={0.8} /> {/* Cyan stickie */}
        </mesh>
        <mesh position={[0.82, 0.38, 0.019]}>
          <planeGeometry args={[0.22, 0.02]} />
          <meshBasicMaterial color="#334155" transparent opacity={0.18} />
        </mesh>

        {/* Bottom Horizontal Marker Pen Metal Tray */}
        <mesh position={[0, -0.78, 0.04]} castShadow>
          <boxGeometry args={[1.5, 0.02, 0.08]} />
          <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Red, Cyan, and Black whiteboard marker pens resting inside the tray */}
        <mesh position={[-0.2, -0.76, 0.05]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.015, 0.015, 0.12, 8]} />
          <meshStandardMaterial color="#ff0055" roughness={0.5} />
        </mesh>
        <mesh position={[0.0, -0.76, 0.05]} rotation={[0, 0.25, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.015, 0.015, 0.12, 8]} />
          <meshStandardMaterial color="#00ccff" roughness={0.5} />
        </mesh>
        <mesh position={[0.2, -0.76, 0.05]} rotation={[0, -0.15, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.015, 0.015, 0.12, 8]} />
          <meshStandardMaterial color="#1e293b" roughness={0.6} />
        </mesh>

        {/* Hover Highlight Overlay Aura when cursor is hovered */}
        {hoveredNode === 'poster' && (
          <mesh position={[0, 0, -0.01]}>
            <planeGeometry args={[2.42, 1.72]} />
            <meshBasicMaterial color="#ff007f" transparent opacity={0.15} />
          </mesh>
        )}
      </group>

      {/* Floor Lamp Neon Aura */}
      <group position={[-5.0, -2.5, -4.0]} name="floor-neon-glowing-lamp">
        <mesh castShadow position={[0, 1.8, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 3.6, 16]} />
          <meshStandardMaterial color="#0a0a1a" roughness={0.4} />
        </mesh>
        {/* Bottom glowing capsule */}
        <mesh position={[0, 3.5, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 0.6, 16]} />
          <meshBasicMaterial color="#ff007f" />
        </mesh>
        <pointLight position={[0, 3.5, 0]} color="#ff007f" intensity={2.0 * ledIntensity} distance={6} />
      </group>

      {/* Ceiling slowly-rotating Fan */}
      <group position={[0, 4.3, 0]} name="ceiling-fan-group">
        {/* Rod connection to ceiling */}
        <mesh castShadow position={[0, 0.3, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.6, 8]} />
          <meshStandardMaterial color="#050510" roughness={0.3} />
        </mesh>
        {/* Central fan motor rotor cap */}
        <mesh castShadow>
          <cylinderGeometry args={[0.4, 0.4, 0.15, 12]} />
          <meshStandardMaterial color={isNight ? '#090918' : '#475569'} roughness={0.2} />
        </mesh>
        {/* Blades spinning hub */}
        <group ref={fanRef}>
          {/* Blade 1 */}
          <mesh position={[1.2, 0, 0]}>
            <boxGeometry args={[1.8, 0.015, 0.2]} />
            <meshStandardMaterial color={isNight ? '#0b0c16' : '#64748b'} roughness={0.6} />
          </mesh>
          {/* Blade 2 */}
          <mesh position={[-1.2, 0, 0]}>
            <boxGeometry args={[1.8, 0.015, 0.2]} />
            <meshStandardMaterial color={isNight ? '#0b0c16' : '#64748b'} roughness={0.6} />
          </mesh>
          {/* Blade 3 */}
          <mesh position={[0, 0, 1.2]} rotation={[0, Math.PI / 2, 0]}>
            <boxGeometry args={[1.8, 0.015, 0.2]} />
            <meshStandardMaterial color={isNight ? '#0b0c16' : '#64748b'} roughness={0.6} />
          </mesh>
          {/* Blade 4 */}
          <mesh position={[0, 0, -1.2]} rotation={[0, Math.PI / 2, 0]}>
            <boxGeometry args={[1.8, 0.015, 0.2]} />
            <meshStandardMaterial color={isNight ? '#0b0c16' : '#64748b'} roughness={0.6} />
          </mesh>
        </group>
      </group>


      {/* THE CENTRAL WORK DESK UNIT */}
      <group position={[0, -1.2, -3.2]} name="desk-assembly">
        {/* Glass Desk Top Plank */}
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
        {/* Left Leg */}
        <mesh castShadow position={[-1.9, -0.66, 0]} name="desk-leg-l">
          <boxGeometry args={[0.15, 1.2, 1.4]} />
          <meshStandardMaterial color={isNight ? '#050510' : '#475569'} roughness={0.6} />
        </mesh>
        {/* Right Leg */}
        <mesh castShadow position={[1.9, -0.66, 0]} name="desk-leg-r">
          <boxGeometry args={[0.15, 1.2, 1.4]} />
          <meshStandardMaterial color={isNight ? '#050510' : '#475569'} roughness={0.6} />
        </mesh>

        {/* NEON HIGHLIGHT STRIP IN DESK EDGE */}
        <mesh position={[0, 0.015, 0.91]} name="desk-neon-trim">
          <boxGeometry args={[4.0, 0.03, 0.03]} />
          <meshBasicMaterial color={isNight ? '#ff007f' : '#00f0ff'} />
        </mesh>


        {/* COCKPIT CHAIR */}
        <group
          position={[0, -0.6, 1.4]}
          name="cyberspace-cockpit-chair"
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
              // Constraint: realistically clamp the swivel angle from -125 to 125 deg (-2.2 to 2.2 rad)
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
              if (window.playGlitchBeep) {
                window.playGlitchBeep('beep');
              }
              onChairDragChange?.(false);
            }
          }}
          onPointerOver={() => handlePointerOver('chair')}
          onPointerOut={(e) => {
            handlePointerOut();
            if (isDraggingChair.current) {
              isDraggingChair.current = false;
              onChairDragChange?.(false);
            }
          }}
        >
          {/* Hinged Base component (STATIC - does not rotate) */}
          <group name="chair-static-base">
            {/* Floor wide star-shaped stand */}
            <mesh castShadow position={[0, -0.8, 0]}>
              <cylinderGeometry args={[0.6, 0.62, 0.06, 12]} />
              <meshStandardMaterial color="#0d0d1e" roughness={0.6} />
            </mesh>
            {/* Bottom cylinder pedestal tube */}
            <mesh castShadow position={[0, -0.62, 0]}>
              <cylinderGeometry args={[0.1, 0.1, 0.36, 8]} />
              <meshStandardMaterial color="#050510" roughness={0.4} />
            </mesh>
            {/* Friction neck hinge joint connector */}
            <mesh castShadow position={[0, -0.44, 0]}>
              <cylinderGeometry args={[0.14, 0.14, 0.08, 12]} />
              <meshStandardMaterial color="#2d2d38" metalness={0.7} roughness={0.3} />
            </mesh>
          </group>

          {/* Swiveling chair seat cushion, lumbar support and neon lines (ROTATES) */}
          <group ref={chairRef} name="chair-rotating-upper">
            {/* Upper spindle link sleeve */}
            <mesh castShadow position={[0, -0.38, 0]}>
              <cylinderGeometry args={[0.16, 0.16, 0.12, 12]} />
              <meshStandardMaterial color="#00f0ff" roughness={0.2} metalness={0.8} />
            </mesh>
            {/* Seat cushion */}
            <mesh castShadow position={[0, -0.28, 0]}>
              <boxGeometry args={[1.0, 0.15, 0.95]} />
              <meshStandardMaterial color={hoveredNode === 'chair' ? '#00f0ff' : (isNight ? '#0a0a20' : '#e2e8f0')} roughness={0.5} />
            </mesh>
            {/* Lumbar Back Support */}
            <mesh castShadow position={[0, 0.42, -0.42]} rotation={[0.08, 0, 0]}>
              <boxGeometry args={[0.9, 1.2, 0.12]} />
              <meshStandardMaterial color={isNight ? '#040410' : '#cbd5e1'} roughness={0.4} />
            </mesh>
            {/* Chair cyber-neon highlight lines */}
            <mesh position={[0, 0.42, -0.49]}>
              <boxGeometry args={[0.8, 0.04, 0.04]} />
              <meshBasicMaterial color="#ff007f" />
            </mesh>
          </group>
        </group>


        {/* GAMING KEYBOARD & MOUSE */}
        <group
          ref={keyboardRef}
          position={[-0.3, 0.08, 0.2]}
          name="rgb-accessories"
          onPointerOver={() => handlePointerOver('keyboard')}
          onPointerOut={handlePointerOut}
          onClick={(e) => {
            e.stopPropagation();
            if (window.playGlitchBeep) {
              window.playGlitchBeep('beep');
            }
          }}
        >
          {/* Keyboard chassis */}
          <mesh castShadow position={[0, -0.01, 0]}>
            <boxGeometry args={[0.9, 0.03, 0.3]} />
            <meshStandardMaterial
              color={hoveredNode === 'keyboard' ? '#0f0f2d' : '#050510'}
              roughness={0.8}
            />
          </mesh>
          {/* RGB glow simulator */}
          <mesh position={[0, 0.01, 0]}>
            <planeGeometry args={[0.85, 0.25]} />
            <meshBasicMaterial
              color={hoveredNode === 'keyboard' ? '#ff007f' : '#00f0ff'}
              transparent
              opacity={hoveredNode === 'keyboard' ? 0.95 : 0.6}
            />
          </mesh>
          {/* Mouse pad */}
          <mesh position={[0.75, -0.015, 0.02]} rotation={[0, 0, 0]}>
            <planeGeometry args={[0.35, 0.35]} />
            <meshStandardMaterial color="#0c0c1c" roughness={0.9} />
          </mesh>
          {/* Gaming Mouse */}
          <mesh castShadow position={[0.75, 0.01, 0.02]}>
            <boxGeometry args={[0.08, 0.04, 0.14]} />
            <meshStandardMaterial
              color={hoveredNode === 'keyboard' ? '#ff007f' : '#04040c'}
              roughness={0.3}
            />
          </mesh>
        </group>


        {/* INTERACTIVE COFFEE MUG (CLICK TO ROTATE) */}
        <group
          ref={mugRef}
          position={[-1.2, 0.08, 0.4]}
          name="coffee-mug-interactive"
          onClick={handleMugClick}
          onPointerOver={() => handlePointerOver('mug')}
          onPointerOut={handlePointerOut}
        >
          {/* Mug cylinder body */}
          <mesh castShadow position={[0, 0.11, 0]}>
            <cylinderGeometry args={[0.07, 0.07, 0.22, 16]} />
            <meshStandardMaterial
              color={hoveredNode === 'mug' ? '#00f0ff' : '#030312'}
              roughness={0.1}
              metalness={0.8}
              emissive={hoveredNode === 'mug' ? '#00f0ff' : '#000000'}
              emissiveIntensity={0.25}
            />
          </mesh>
          {/* Handle of the mug */}
          <mesh castShadow position={[-0.08, 0.11, 0]} rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[0.06, 0.018, 8, 16, Math.PI]} />
            <meshStandardMaterial color={hoveredNode === 'mug' ? '#00f0ff' : '#030312'} roughness={0.1} />
          </mesh>
          {/* Coffee level inside */}
          <mesh position={[0, 0.21, 0]}>
            <cylinderGeometry args={[0.062, 0.062, 0.01, 12]} />
            <meshStandardMaterial color="#301508" roughness={0.9} />
          </mesh>
        </group>


        {/* INTERACTIVE DESK LAMP (CLICK TO CYCLE LIGHT INTENSITY) */}
        <group
          ref={lampRef}
          position={[1.5, 0.06, 0.3]}
          rotation={[0, -0.6, 0]}
          name="desk-lamp-interactive"
          onClick={handleLampClick}
          onPointerOver={() => handlePointerOver('lamp')}
          onPointerOut={handlePointerOut}
        >
          {/* Flat Heavy Base resting exactly on desk surface */}
          <mesh castShadow position={[0, 0.02, 0]}>
            <cylinderGeometry args={[0.18, 0.2, 0.04, 16]} />
            <meshStandardMaterial color={hoveredNode === 'lamp' ? '#ff007f' : '#0a0c16'} roughness={0.2} metalness={0.9} />
          </mesh>
          
          {/* Base Cylindrical Rotation Joint Block */}
          <mesh castShadow position={[0, 0.05, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.04, 0.04, 0.08, 12]} />
            <meshStandardMaterial color="#222538" metalness={0.9} roughness={0.1} />
          </mesh>

          {/* Lower Support Arm (Slanted backwards, perfectly attached) */}
          <mesh castShadow position={[0.06, 0.24, -0.06]} rotation={[0.25, 0, -0.15]}>
            <cylinderGeometry args={[0.016, 0.016, 0.42, 8]} />
            <meshStandardMaterial color={hoveredNode === 'lamp' ? '#ff007f' : '#1a1c32'} roughness={0.4} metalness={0.8} />
          </mesh>

          {/* Elbow Joint Sphere */}
          <mesh castShadow position={[0.12, 0.44, -0.12]}>
            <sphereGeometry args={[0.04, 12, 12]} />
            <meshStandardMaterial color={hoveredNode === 'lamp' ? '#ff007f' : '#00f0ff'} metalness={0.95} />
          </mesh>

          {/* Upper Arm (Slanted forward, perfectly pivoted at肘) */}
          <mesh castShadow position={[0.02, 0.575, 0.01]} rotation={[-0.45, 0, 0.1]}>
            <cylinderGeometry args={[0.012, 0.012, 0.40, 8]} />
            <meshStandardMaterial color={hoveredNode === 'lamp' ? '#ff007f' : '#1a1c32'} roughness={0.4} metalness={0.8} />
          </mesh>

          {/* Shade Hinge Pivot Pin */}
          <mesh castShadow position={[-0.08, 0.71, 0.14]}>
            <sphereGeometry args={[0.03, 10, 10]} />
            <meshStandardMaterial color="#ff007f" />
          </mesh>

          {/* Lamp shade/head pointing down and slightly forward */}
          <group position={[-0.1, 0.74, 0.16]} rotation={[0.45, 0, -0.1]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.14, 0.07, 0.18, 16]} />
              <meshStandardMaterial color="#0c0e18" roughness={0.3} metalness={0.8} />
            </mesh>
            {/* Glowing bulb */}
            <mesh position={[0, -0.07, 0]}>
              <sphereGeometry args={[0.048, 12, 12]} />
              <meshBasicMaterial
                color={
                  lampIntensityState === 'bright' ? '#ffffff' :
                  lampIntensityState === 'dim' ? '#ffa500' : '#222222'
                }
              />
            </mesh>
            {/* Volumetric ambient light cone projection simulation */}
            {lampIntensityState !== 'off' && (
              <mesh position={[0, -0.45, 0]} rotation={[0, 0, 0]}>
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
            {/* Dynamic spot Light */}
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
            {/* Soft point glow ambient helper */}
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


        {/* DUAL DESKTOP MONITORS -> Clicked controls ABOUT Section */}
        <group
          position={[-0.8, 0.58, -0.5]}
          rotation={[0, 0.15, 0]}
          name="monitors-assembly"
          onPointerOver={() => handlePointerOver('monitors')}
          onPointerOut={handlePointerOut}
          onClick={(e) => handleClickSection('ABOUT', e)}
        >
          {/* Heavy Desk-Clamped Cylinder Column (Highly Visible Monitor Stand) */}
          <mesh castShadow position={[0, -0.18, -0.06]}>
            <cylinderGeometry args={[0.045, 0.045, 0.68, 16]} />
            <meshStandardMaterial color="#1a1c24" roughness={0.3} metalness={0.93} />
          </mesh>

          {/* Heavy Desk Mount Clamp Base Plate resting clearly on top of the glass desk top */}
          <mesh position={[0, -0.49, -0.06]} castShadow>
            <boxGeometry args={[0.55, 0.035, 0.34]} />
            <meshStandardMaterial color="#0d0e14" roughness={0.2} metalness={0.95} />
          </mesh>

          {/* Table edge clamp reinforcement brackets underneath columns */}
          <mesh position={[0, -0.54, -0.21]} castShadow>
            <boxGeometry args={[0.16, 0.14, 0.1]} />
            <meshStandardMaterial color="#07080c" roughness={0.5} metalness={0.88} />
          </mesh>

          {/* Visible mechanical extending bracket arms going to each screen */}
          {/* Left support arm */}
          <mesh castShadow position={[-0.42, 0.12, -0.03]} rotation={[0, 0.08, 0]}>
            <boxGeometry args={[0.85, 0.04, 0.04]} />
            <meshStandardMaterial color="#1e202a" metalness={0.8} roughness={0.3} />
          </mesh>

          {/* Right support arm */}
          <mesh castShadow position={[0.42, 0.12, -0.09]} rotation={[0, -0.08, 0]}>
            <boxGeometry args={[0.85, 0.04, 0.04]} />
            <meshStandardMaterial color="#1e202a" metalness={0.8} roughness={0.3} />
          </mesh>

          {/* MONITOR 1: LEFT PANEL - Relocated to -0.85 for clear gap */}
          <group position={[-0.85, 0.12, 0.02]} rotation={[0, 0.2, 0]} name="monitor-panel-left">
            <mesh castShadow>
              <boxGeometry args={[1.3, 0.82, 0.06]} />
              <meshStandardMaterial
                color={hoveredNode === 'monitors' || currentSection === 'ABOUT' ? '#00f0ff' : '#05050a'}
                emissive={hoveredNode === 'monitors' || currentSection === 'ABOUT' ? '#00f0ff' : '#020208'}
                emissiveIntensity={0.2}
              />
            </mesh>
            {/* Display screen */}
            <mesh position={[0, 0, 0.031]}>
              <planeGeometry args={[1.22, 0.74]} />
              <meshBasicMaterial color="#030310" />
            </mesh>
            {/* Dynamic glowing binary nodes display */}
            <mesh position={[0, 0, 0.035]}>
              <planeGeometry args={[1.15, 0.68]} />
              <meshBasicMaterial
                color="#00f0ff"
                transparent
                opacity={0.15}
                blending={THREE.AdditiveBlending}
              />
            </mesh>
            {/* Futuristic layout visuals */}
            <mesh position={[-0.2, 0.1, 0.040]}>
              <planeGeometry args={[0.4, 0.2]} />
              <meshBasicMaterial color="#ff007f" transparent opacity={0.6} />
            </mesh>
            <mesh position={[0.2, -0.1, 0.045]}>
              <planeGeometry args={[0.5, 0.35]} />
              <meshBasicMaterial color="#00f0ff" transparent opacity={0.4} />
            </mesh>
          </group>

          {/* MONITOR 2: RIGHT PANEL - Relocated to 0.85 for clear gap */}
          <group position={[0.85, 0.12, -0.12]} rotation={[0, -0.12, 0]} name="monitor-panel-right">
            <mesh castShadow>
              <boxGeometry args={[1.3, 0.82, 0.06]} />
              <meshStandardMaterial
                color={hoveredNode === 'monitors' || currentSection === 'ABOUT' ? '#00f0ff' : '#05050a'}
                emissive={hoveredNode === 'monitors' || currentSection === 'ABOUT' ? '#00f0ff' : '#020210'}
                emissiveIntensity={0.2}
              />
            </mesh>
            {/* Display screen */}
            <mesh position={[0, 0, 0.031]}>
              <planeGeometry args={[1.22, 0.74]} />
              <meshBasicMaterial color="#05050a" />
            </mesh>
            {/* Active glowing green/cyan binary lines */}
            <mesh position={[0, 0, 0.035]}>
              <planeGeometry args={[1.15, 0.68]} />
              <meshBasicMaterial
                color="#00f0ff"
                transparent
                opacity={0.12}
                blending={THREE.AdditiveBlending}
              />
            </mesh>
            <mesh position={[0, 0.1, 0.040]}>
              <planeGeometry args={[0.9, 0.03]} />
              <meshBasicMaterial color="#ff007f" />
            </mesh>
            <mesh position={[-0.2, -0.15, 0.045]}>
              <planeGeometry args={[0.4, 0.03]} />
              <meshBasicMaterial color="#00f0ff" />
            </mesh>
          </group>
        </group>


        {/* INTERACTIVE LAPTOP -> Clicked controls PROJECTS Section */}
        <group
          position={[0.8, 0.08, -0.1]}
          rotation={[0, -0.4, 0]}
          name="laptop-interactive-mesh"
          onPointerOver={() => handlePointerOver('laptop')}
          onPointerOut={handlePointerOut}
          onClick={(e) => handleClickSection('PROJECTS', e)}
        >
          {/* Laptop Base chassis */}
          <mesh castShadow position={[0, 0.01, 0]}>
            <boxGeometry args={[0.55, 0.02, 0.38]} />
            <meshStandardMaterial
              color={hoveredNode === 'laptop' || currentSection === 'PROJECTS' ? '#00f0ff' : '#0a0a14'}
              roughness={0.4}
              metalness={0.9}
            />
          </mesh>
          {/* Laptop display lid (angled up at 115 degrees) */}
          <group position={[0, 0.01, -0.18]} rotation={[1.8, 0, 0]}>
            <mesh castShadow position={[0, 0.2, 0]}>
              <boxGeometry args={[0.55, 0.4, 0.02]} />
              <meshStandardMaterial color="#0a0a14" roughness={0.3} metalness={0.8} />
            </mesh>
            {/* Glowing laptop screen */}
            <mesh position={[0, 0.2, 0.012]}>
              <planeGeometry args={[0.51, 0.34]} />
              <meshBasicMaterial
                color={hoveredNode === 'laptop' ? '#ff007f' : '#00f0ff'}
                transparent
                opacity={0.8}
              />
            </mesh>
            {/* Cyber core laptop light */}
            <pointLight position={[0, 0.2, 0.15]} color={hoveredNode === 'laptop' ? '#ff007f' : '#00f0ff'} intensity={1.5} distance={1.5} />
          </group>
          {/* Glowing laptop keyboard trackpad */}
          <mesh position={[0, 0.021, 0.04]}>
            <planeGeometry args={[0.4, 0.15]} />
            <meshBasicMaterial color="#ff007f" transparent opacity={0.3} />
          </mesh>
        </group>


        {/* INDOOR BIO PLANT */}
        <group position={[-1.7, 0.08, 0.5]} name="workspace-plant">
          {/* Hexagonal container pot */}
          <mesh castShadow position={[0, 0.15, 0]}>
            <cylinderGeometry args={[0.22, 0.15, 0.3, 6]} />
            <meshStandardMaterial color="#090a16" roughness={0.5} />
          </mesh>
          {/* Simulated pixel soil */}
          <mesh position={[0, 0.29, 0]}>
            <cylinderGeometry args={[0.2, 0.2, 0.02, 6]} />
            <meshStandardMaterial color="#020104" roughness={0.9} />
          </mesh>
          {/* Abstract cyber stalks (voxel/blocky green design) */}
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


        {/* INTERACTIVE RETRO-FUTURISTIC WATER CAN (CLICK TO WATER THE PLANT AND BOOST VIRTUAL SYSTEM PERFORMANCE) */}
        <group
          ref={waterCanRef}
          position={[-1.25, 0.08, 0.45]}
          rotation={[0, 0.4, 0]}
          name="water-can-interactive"
          onPointerOver={() => handlePointerOver('water_can')}
          onPointerOut={handlePointerOut}
          onClick={handleWaterCanClick}
        >
          {/* Main canister (metal body) */}
          <mesh castShadow position={[0, 0.12, 0]}>
            <cylinderGeometry args={[0.08, 0.09, 0.22, 12]} />
            <meshStandardMaterial
              color={hoveredNode === 'water_can' ? '#00f0ff' : '#0a0d1a'}
              roughness={0.15}
              metalness={0.9}
              emissive={hoveredNode === 'water_can' ? '#00f0ff' : '#000000'}
              emissiveIntensity={0.2}
            />
          </mesh>

          {/* Long slender spout slanted forward */}
          <mesh castShadow position={[-0.18, 0.18, 0.0]} rotation={[0, 0, -1.05]}>
            <cylinderGeometry args={[0.012, 0.018, 0.28, 8]} />
            <meshStandardMaterial color={hoveredNode === 'water_can' ? '#00f0ff' : '#1e293b'} metalness={0.8} />
          </mesh>
          <mesh castShadow position={[-0.30, 0.28, 0.0]} rotation={[0, 0, -0.45]}>
            <cylinderGeometry args={[0.012, 0.012, 0.10, 8]} />
            <meshStandardMaterial color={hoveredNode === 'water_can' ? '#ff007f' : '#1e293b'} />
          </mesh>

          {/* Sprinkling Head (rose nozzle) */}
          <mesh castShadow position={[-0.34, 0.31, 0.0]} rotation={[0, 0, 0.8]}>
            <cylinderGeometry args={[0.024, 0.012, 0.04, 10]} />
            <meshStandardMaterial color="#ff007f" roughness={0.2} />
          </mesh>

          {/* Retro Loop Handle */}
          <mesh castShadow position={[0.09, 0.14, 0]} rotation={[0, 0, -Math.PI / 4]}>
            <torusGeometry args={[0.08, 0.015, 8, 16, Math.PI]} />
            <meshStandardMaterial color="#0b0d1a" metalness={0.9} roughness={0.3} />
          </mesh>

          {/* Neon cooling water tank scale detail */}
          <mesh position={[0.0, 0.12, 0.091]}>
            <planeGeometry args={[0.03, 0.12]} />
            <meshBasicMaterial color={isWatering ? '#ff007f' : '#00f0ff'} />
          </mesh>

          {/* Floating diagnostic dashboard text indicating performance optimization */}
          {hoveredNode === 'water_can' && (
            <Html position={[0, 0.45, 0]} center distanceFactor={2.5}>
              <div className="bg-[#050510]/95 border border-[#ff007f] px-2 py-1 select-none pointer-events-none backdrop-blur-md">
                <span className="font-mono text-[8px] tracking-wider text-white flex flex-col items-center leading-tight">
                  <span>[H2O COOLANT CAN]</span>
                  <span className="text-[#00f0ff] font-bold mt-0.5">STATUS: {wateringStatusText}</span>
                  {isWatering && <span className="text-[#ff007f] animate-pulse">OPTIMIZING OVERLOAD</span>}
                </span>
              </div>
            </Html>
          )}

          {/* Embedded Water Cascading Droplets Particle System */}
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


        {/* RETRO-CYBER LABELED CUSTOM MEDIA CARTRIDGES */}
        <group position={[1.2, 0.08, 0.1]} rotation={[0, -0.6, 0]}>
          {/* Cartridge 1 */}
          <mesh castShadow position={[0, 0.008, 0]} rotation={[0, 0.1, 0]}>
            <boxGeometry args={[0.16, 0.016, 0.16]} />
            <meshStandardMaterial color="#0b0c16" roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.017, 0.02]} rotation={[0, 0.1, 0]}>
            <planeGeometry args={[0.12, 0.08]} />
            <meshBasicMaterial color="#00f0ff" />
          </mesh>
          {/* Slider metal element */}
          <mesh position={[-0.05, 0.01, -0.06]}>
            <boxGeometry args={[0.04, 0.02, 0.03]} />
            <meshStandardMaterial color="#ff007f" metalness={0.9} />
          </mesh>

          {/* Cartridge 2 */}
          <mesh castShadow position={[0.01, 0.024, 0.01]} rotation={[0, -0.15, 0]}>
            <boxGeometry args={[0.16, 0.016, 0.16]} />
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
      </group>


      {/* INTERACTIVE DIGITAL BOOKSHELF -> Clicked controls SKILLS / EXPERIENCE */}
      <group
        position={[4.2, -0.9, -3.4]}
        rotation={[0, -0.25, 0]}
        name="bookshelf-assembly"
        onPointerOver={() => handlePointerOver('bookshelf')}
        onPointerOut={handlePointerOut}
        onClick={(e) => handleClickSection('SKILLS', e)}
      >
        {/* Outline frame support columns */}
        <mesh castShadow position={[-1.0, 0.8, 0]}>
          <boxGeometry args={[0.08, 3.2, 0.7]} />
          <meshStandardMaterial color="#050510" roughness={0.4} />
        </mesh>
        <mesh castShadow position={[1.0, 0.8, 0]}>
          <boxGeometry args={[0.08, 3.2, 0.7]} />
          <meshStandardMaterial color="#050510" roughness={0.4} />
        </mesh>

        {/* Shelf tier 1 (Lower) */}
        <mesh castShadow receiveShadow position={[0, 0.1, 0]}>
          <boxGeometry args={[2.0, 0.08, 0.65]} />
          <meshStandardMaterial color="#050510" roughness={0.3} metalness={0.7} />
        </mesh>
        
        {/* Glow node running inside shelf 1 */}
        <mesh position={[0, 0.1, 0.33]}>
          <boxGeometry args={[1.9, 0.02, 0.02]} />
          <meshBasicMaterial color={hoveredNode === 'bookshelf' || currentSection === 'SKILLS' ? '#ff007f' : '#00f0ff'} />
        </mesh>

        {/* Custom procedural digital voxel books on Lower shelf */}
        <group position={[0, 0.45, -0.05]}>
          {/* Book 1 (cyan) */}
          <mesh castShadow position={[-0.7, 0, 0]} rotation={[0, 0.04, 0]}>
            <boxGeometry args={[0.13, 0.58, 0.45]} />
            <meshStandardMaterial color="#00f0ff" roughness={0.2} emissive="#00f0ff" emissiveIntensity={0.15} />
          </mesh>
          {/* Book 2 (magenta) */}
          <mesh castShadow position={[-0.52, 0, 0.01]} rotation={[0, -0.06, 0]}>
            <boxGeometry args={[0.14, 0.65, 0.42]} />
            <meshStandardMaterial color="#ff007f" roughness={0.2} emissive="#ff007f" emissiveIntensity={0.1} />
          </mesh>
          {/* Leaning Book 3 (dark violet) */}
          <mesh castShadow position={[-0.32, -0.05, 0]} rotation={[0, 0, -0.28]}>
            <boxGeometry args={[0.12, 0.54, 0.45]} />
            <meshStandardMaterial color="#421a68" roughness={0.6} />
          </mesh>
          {/* Decorative voxel tech artifact */}
          <mesh castShadow position={[0.4, -0.15, 0]}>
            <boxGeometry args={[0.3, 0.3, 0.3]} />
            <meshStandardMaterial
              color={hoveredNode === 'bookshelf' ? '#00f0ff' : '#141428'}
              roughness={0.1}
              metalness={0.9}
            />
          </mesh>
        </group>

        {/* Shelf tier 2 (Middle) */}
        <mesh castShadow receiveShadow position={[0, 1.1, 0]}>
          <boxGeometry args={[2.0, 0.08, 0.65]} />
          <meshStandardMaterial color="#050510" roughness={0.3} metalness={0.7} />
        </mesh>

        {/* Glow node running inside shelf 2 */}
        <mesh position={[0, 1.1, 0.33]}>
          <boxGeometry args={[1.9, 0.02, 0.02]} />
          <meshBasicMaterial color={hoveredNode === 'bookshelf' || currentSection === 'SKILLS' ? '#ff007f' : '#00f0ff'} />
        </mesh>

        {/* Books + components on Middle shelf */}
        <group position={[0, 1.42, -0.05]}>
          {/* Folder box 1 */}
          <mesh castShadow position={[0.6, 0, 0.02]}>
            <boxGeometry args={[0.3, 0.52, 0.48]} />
            <meshStandardMaterial color="#1a1c31" roughness={0.5} />
          </mesh>
          {/* Leaning book 1 */}
          <mesh castShadow position={[-0.2, 0, 0]} rotation={[0, 0.1, 0.15]}>
            <boxGeometry args={[0.11, 0.52, 0.42]} />
            <meshStandardMaterial color="#00f0ff" roughness={0.3} />
          </mesh>
          {/* Small cube processor node */}
          <mesh castShadow position={[-0.6, -0.12, 0]} rotation={[0, 0.3, 0]}>
            <boxGeometry args={[0.24, 0.24, 0.24]} />
            <meshStandardMaterial color="#ff007f" roughness={0.1} emissive="#ff007f" emissiveIntensity={0.2} />
          </mesh>
          <pointLight position={[-0.6, -0.12, 0.2]} color="#ff007f" intensity={1.0 * ledIntensity} distance={1.2} />

          {/* SE-1 SENTINEL MECHA MECH TOY (Interactive bookshelf figurine!) */}
          <group position={[0.2, -0.21, 0.12]} rotation={[0, -0.4, 0]}>
            {/* Mecha base */}
            <mesh castShadow position={[0, 0.01, 0]}>
              <cylinderGeometry args={[0.10, 0.12, 0.02, 8]} />
              <meshStandardMaterial color="#0b0d1a" roughness={0.1} metalness={0.9} />
            </mesh>
            {/* Blocky legs */}
            <mesh castShadow position={[-0.03, 0.06, 0]}>
              <boxGeometry args={[0.025, 0.08, 0.025]} />
              <meshStandardMaterial color="#1e1b38" metalness={0.8} />
            </mesh>
            <mesh castShadow position={[0.03, 0.06, 0]}>
              <boxGeometry args={[0.025, 0.08, 0.025]} />
              <meshStandardMaterial color="#1e1b38" metalness={0.8} />
            </mesh>
            {/* Torso */}
            <mesh castShadow position={[0, 0.16, 0]}>
              <boxGeometry args={[0.11, 0.12, 0.08]} />
              <meshStandardMaterial color={hoveredNode === 'bookshelf' ? '#ff007f' : '#0e111d'} roughness={0.3} metalness={0.7} />
            </mesh>
            {/* Neon core visor element */}
            <mesh position={[0, 0.16, 0.041]}>
              <planeGeometry args={[0.04, 0.04]} />
              <meshBasicMaterial color="#00f0ff" />
            </mesh>
            {/* Head */}
            <mesh castShadow position={[0, 0.25, 0]}>
              <boxGeometry args={[0.06, 0.06, 0.06]} />
              <meshStandardMaterial color="#1f1f38" metalness={0.9} />
            </mesh>
            <mesh position={[0, 0.26, 0.031]}>
              <planeGeometry args={[0.04, 0.01]} />
              <meshBasicMaterial color="#ff007f" />
            </mesh>
            {/* Shoulder armor attachments */}
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

        {/* Shelf tier 3 (Upper) */}
        <mesh castShadow receiveShadow position={[0, 2.1, 0]}>
          <boxGeometry args={[2.0, 0.08, 0.65]} />
          <meshStandardMaterial color="#050510" roughness={0.3} metalness={0.7} />
        </mesh>
      </group>
    </group>
  );
}
