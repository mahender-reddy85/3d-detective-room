/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Project, SkillGroup, Experience } from './types';

export const USER_EMAIL = 'likkimahenderreddy123@gmail.com';

export const PROJECTS_DATA: Project[] = [
  {
    id: 'compiler',
    title: 'NEXUS-COMPILER PRO',
    description: 'A low-latency WebAssembly compiler with autonomous micro-agent optimizations. Automatically compiles complex logical nodes into highly portable machine instructions.',
    category: 'SYSTEMS',
    tags: ['Rust', 'WebAssembly', 'LLVM', 'TS'],
    role: 'Core Systems Architect',
    impactCode: 'COMP_SPEED_RATIO // +380% OVER BASELINE',
    stats: [
      { label: 'Compile Speed', value: '0.42ms' },
      { label: 'Memory Overhead', value: '4.2KB' },
      { label: 'Compression Ratio', value: '94.1%' }
    ],
    liveUrl: '#',
    sourceUrl: '#'
  },
  {
    id: 'antigravity-visualizer',
    title: 'GLITCH-CANVAS PRO',
    description: 'An interactive audio-reactive WebGL engine implementing real-time vertex displacement and CRT diffraction grids using custom GLSL fragment shaders.',
    category: 'WEBGL / R3F',
    tags: ['React Three Fiber', 'Three.js', 'GLSL', 'Web Audio'],
    role: 'Visual Rig Specialist',
    impactCode: 'VERTEX_DISPLACEMENT // 60FPS LOCKED',
    stats: [
      { label: 'Draw Calls', value: '18 avg' },
      { label: 'Audio Latency', value: '2.4ms' },
      { label: 'Shader Pass Duration', value: '0.12ms' }
    ],
    liveUrl: '#',
    sourceUrl: '#'
  },
  {
    id: 'cognitive-relay',
    title: 'COGNITIVE CORE-LINK',
    description: 'A deep-knowledge decentralized retrieval context network that structures vector responses instantly using specialized graph databases and local persistent cache files.',
    category: 'NEURAL NETS',
    tags: ['Gemini SDK', 'Node.js', 'Vector DB', 'Redis'],
    role: 'Neural Eng Direct',
    impactCode: 'RETRIEVAL_LATENCY_REDUCTION // -78.4%',
    stats: [
      { label: 'Index Capacity', value: '41.2M nodes' },
      { label: 'Query Time', value: '12.8ms' },
      { label: 'Accuracy Threshold', value: '98.9%' }
    ],
    liveUrl: '#',
    sourceUrl: '#'
  }
];

export const SKILLS_DATA: SkillGroup[] = [
  {
    category: 'CORE SYSTEMS',
    skills: [
      { name: 'TypeScript / Javascript', level: 95, status: 'OVERCLOCKED' },
      { name: 'WebGL / Three.js', level: 90, status: 'STABLE' },
      { name: 'React Context & Fiber API', level: 88, status: 'OPTIMAL' },
      { name: 'Tailwind CSS Structure', level: 94, status: 'STABLE' }
    ]
  },
  {
    category: 'PERIPHERAL INFRA',
    skills: [
      { name: 'Node.js & Express Matrix', level: 86, status: 'OPTIMAL' },
      { name: 'Rust & WASM Binder', level: 82, status: 'STABLE' },
      { name: 'Firebase & Firestore Stream', level: 85, status: 'STABLE' },
      { name: 'GLSL Pixel Shaders', level: 80, status: 'DEGRADED' }
    ]
  },
  {
    category: 'DIAGNOSTICS & PARADIGMS',
    skills: [
      { name: 'Git Pipeline Synchronization', level: 92, status: 'STABLE' },
      { name: 'Docker Virtualization Containers', level: 84, status: 'STABLE' },
      { name: 'Direct Audio Synthesis', level: 78, status: 'OPTIMAL' },
      { name: 'Vector Database Geometry', level: 83, status: 'STABLE' }
    ]
  }
];

export const EXPERIENCE_DATA: Experience[] = [
  {
    id: 'exp-1',
    period: '2024 - 2026',
    role: 'Lead Cognitive Systems Rig',
    company: 'NEURAL NET TRACERS CORP',
    tagline: 'Orchestrating modular runtime compilers and Three.js simulations.',
    details: [
      'Engineered interactive 3D telemetry panels using React Three Fiber to stream system state profiles at 60 FPS.',
      'Constructed modular micro-agent integration with the Gemini API to analyze error telemetry logs in real time.',
      'Refactored legacy server architectures to Node.js / Express containers, shortening response pipelines by 120ms.'
    ],
    integrityScore: '99.8% SECURE'
  },
  {
    id: 'exp-2',
    period: '2022 - 2024',
    role: 'Senior Visual Engineer',
    company: 'CYBER-LIGHT LABS',
    tagline: 'Pioneered custom WebGL environments and spatial audio vectors.',
    details: [
      'Developed interactive high-fidelity 3D workspace models allowing custom mechanical manipulation.',
      'Designed complex Tailwind style sheets simulating VHS degradation and CRT scanline arrays without frame delays.',
      'Integrated real-time persistence with Firestore, handling 50k+ daily events under custom security rules.'
    ],
    integrityScore: '98.4% STABLE'
  },
  {
    id: 'exp-3',
    period: '2020 - 2022',
    role: 'Systems Developer Operator',
    company: 'QUANTUM LOGIC DEVS',
    tagline: 'Maintained and deployed high-performance microservices.',
    details: [
      'Built fast, declarative UI prototypes using Vite, bundling modular modules into standalone static assets.',
      'Oversaw developer transition to modern TypeScript, achieving full type-safety coverage and preventing runtime compilation failure.',
      'Created custom low-frequency synthesizers with the Web Audio API for interactive desktop projects.'
    ],
    integrityScore: '95.1% OPTIMAL'
  }
];
