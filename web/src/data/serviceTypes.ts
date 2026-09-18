import {
  Wrench,
  Sparkles,
  TreePine,
  Truck,
  Paintbrush,
  Zap,
  Laptop,
  Video,
  Calculator,
  GraduationCap,
  PenTool,
  Briefcase,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface ServiceType {
  slug: string;
  name: string;
  description: string;
  icon: LucideIcon;
  scope: 'local' | 'remote';
}

// Curated homepage service set spanning in-person trades and remote freelancing.
// Every slug must exist in src/data/services.ts so the card links resolve.
export const serviceTypes: ServiceType[] = [
  // In-person
  {
    slug: 'handyman',
    name: 'Handyman',
    description: 'Repairs, installs, and odd jobs around the home',
    icon: Wrench,
    scope: 'local',
  },
  {
    slug: 'house-cleaning',
    name: 'House Cleaning',
    description: 'Home, office, and move-out cleaning',
    icon: Sparkles,
    scope: 'local',
  },
  {
    slug: 'landscaping',
    name: 'Landscaping',
    description: 'Lawns, trees, hardscaping, and yard work',
    icon: TreePine,
    scope: 'local',
  },
  {
    slug: 'moving-companies',
    name: 'Moving Companies',
    description: 'Local moves, hauling, and heavy lifting',
    icon: Truck,
    scope: 'local',
  },
  {
    slug: 'interior-painting',
    name: 'Interior Painting',
    description: 'Interior painting and touch-ups',
    icon: Paintbrush,
    scope: 'local',
  },
  {
    slug: 'electrical-repairs',
    name: 'Electrical Repairs',
    description: 'Outlets, wiring, and lighting fixes',
    icon: Zap,
    scope: 'local',
  },
  // Remote
  {
    slug: 'website-development',
    name: 'Website Development',
    description: 'Websites, apps, and technical projects',
    icon: Laptop,
    scope: 'remote',
  },
  {
    slug: 'video-editing',
    name: 'Video Editing',
    description: 'Editing, color, and post-production',
    icon: Video,
    scope: 'remote',
  },
  {
    slug: 'bookkeeping',
    name: 'Bookkeeping',
    description: 'Books, payroll, and financial records',
    icon: Calculator,
    scope: 'remote',
  },
  {
    slug: 'online-tutoring',
    name: 'Online Tutoring',
    description: 'Academic subjects and skills, online',
    icon: GraduationCap,
    scope: 'remote',
  },
  {
    slug: 'creative-logo-design',
    name: 'Creative Logo Design',
    description: 'Logos and brand marks',
    icon: PenTool,
    scope: 'remote',
  },
  {
    slug: 'virtual-assistant-services',
    name: 'Virtual Assistant Services',
    description: 'Admin, scheduling, and research support',
    icon: Briefcase,
    scope: 'remote',
  },
];
