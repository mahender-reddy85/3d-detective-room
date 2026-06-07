/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SkylineProps {
  isNight: boolean;
}

export default function Skyline({ isNight }: SkylineProps) {
  const groupRef = useRef<THREE.Group>(null);
  const searchlightRef1 = useRef<THREE.Mesh>(null);
  const searchlightRef2 = useRef<THREE.Mesh>(null);

  // Generate buildings procedurally
  const buildings = useMemo(() => {
    const arr = [];
    const seed = 42;
    const count = 35;
    
    // Pseudo-random generator with seed
    let randValue = seed;
    const random = () => {
      const x = Math.sin(randValue++) * 10000;
      return x - Math.floor(x);
    };

    for (let i = 0; i < count; i++) {
      const height = random() * 8 + 3;
      const width = random() * 1.5 + 0.8;
      const depth = random() * 1.5 + 0.8;
      
      // Orbit around center (which is the room window area far z)
      // Placed far behind the window (z: -12 to -15)
      const x = (random() - 0.5) * 16;
      const y = height / 2 - 5; // offset downwards
      const z = -14 - random() * 4;

      // Color palette matching the Glitch Art design: deep slate vs indigo
      const hue = random() > 0.5 ? 0.9 : 0.55; // magenta - magenta-blue tone
      const baseColor = new THREE.Color().setHSL(hue, 0.7, 0.15);
      
      // Window placement parameters
      const windowRows = Math.floor(height);
      const windowCols = Math.floor(width * 2);

      arr.push({
        id: `building-${i}`,
        position: [x, y, z] as [number, number, number],
        args: [width, height, depth] as [number, number, number],
        color: baseColor,
        windowRows,
        windowCols,
      });
    }
    return arr;
  }, []);

  // Animating neon searchlights scanning the night sky and building glows
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
      // Subtle metropolis breathing
      groupRef.current.position.y = Math.sin(t * 0.4) * 0.05;
    }

    if (searchlightRef1.current) {
      searchlightRef1.current.rotation.z = Math.sin(t * 0.8) * 0.4;
    }
    if (searchlightRef2.current) {
      searchlightRef2.current.rotation.z = Math.cos(t * 0.6) * 0.3;
    }
  });

  return (
    <group ref={groupRef} name="skyline-outer-group">
      {/* Sky Ambient Backdrop Dome */}
      <mesh position={[0, 0, -20]} name="sky-backdrop">
        <planeGeometry args={[50, 30]} />
        <meshBasicMaterial
          color={isNight ? '#03030d' : '#14143a'}
          transparent
          opacity={1}
        />
      </mesh>

      {/* Twinkling Far Distant Stars / Fog Dust */}
      <points name="background-stars">
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[
              useMemo(() => {
                const positions = new Float32Array(50 * 3);
                for (let i = 0; i < 50; i++) {
                  positions[i * 3] = (Math.random() - 0.5) * 30;
                  positions[i * 3 + 1] = Math.random() * 12 - 2;
                  positions[i * 3 + 2] = -18;
                }
                return positions;
              }, []),
              3,
            ]}
          />
        </bufferGeometry>
        <pointsMaterial
          color={isNight ? '#ffffff' : '#ffd500'}
          size={0.12}
          transparent
          opacity={0.8}
        />
      </points>

      {/* Metropolice Towers Block */}
      {buildings.map((b) => (
        <group key={b.id} position={b.position} name={b.id}>
          {/* Main Solid Skyscraper Mesh */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={b.args} />
            <meshStandardMaterial
              color={b.color}
              roughness={0.8}
              metalness={0.2}
            />
          </mesh>

          {/* Windows emission grid mockup */}
          {isNight && (
            <mesh position={[0, 0, b.args[2] / 2 + 0.01]} name={`${b.id}-windows`}>
              <planeGeometry args={[b.args[0] * 0.8, b.args[1] * 0.8]} />
              <meshBasicMaterial
                color={Math.random() > 0.5 ? '#00f0ff' : '#ff007f'}
                transparent
                opacity={0.4}
                blending={THREE.AdditiveBlending}
              />
            </mesh>
          )}
        </group>
      ))}

      {/* Cyberpunk Neon Dual Searchlight Beams */}
      {isNight && (
        <group position={[0, -5, -15]} name="searchlights-nodes">
          <group ref={searchlightRef1} rotation={[0, 0, 0.2]}>
            <mesh position={[0, 10, 0]}>
              <coneGeometry args={[1.5, 20, 16, 1, true]} />
              <meshBasicMaterial
                color="#00f0ff"
                transparent
                opacity={0.06}
                blending={THREE.AdditiveBlending}
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>

          <group ref={searchlightRef2} position={[4, 0, -1]} rotation={[0, 0, -0.2]}>
            <mesh position={[0, 10, 0]}>
              <coneGeometry args={[2.0, 24, 16, 1, true]} />
              <meshBasicMaterial
                color="#ff007f"
                transparent
                opacity={0.08}
                blending={THREE.AdditiveBlending}
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>
        </group>
      )}
    </group>
  );
}
