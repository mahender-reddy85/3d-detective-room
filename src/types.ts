/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type SceneSection = 'ROOM' | 'ABOUT' | 'PROJECTS' | 'SKILLS' | 'CONTACT';

export interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  role: string;
  impactCode: string; // Machine-like code line (e.g. "ERR_RESOLVED [99.8%]")
  stats: { label: string; value: string }[];
  liveUrl?: string;
  sourceUrl?: string;
}

export interface Skill {
  name: string;
  level: number; // 0-100 percentage
  status: 'OPTIMAL' | 'STABLE' | 'DEGRADED' | 'OVERCLOCKED';
}

export interface SkillGroup {
  category: string;
  skills: Skill[];
}

export interface Experience {
  id: string;
  period: string;
  role: string;
  company: string;
  tagline: string;
  details: string[];
  integrityScore: string; // Glitch theme "integrity rating" (e.g. "99.2% SECURE")
}
