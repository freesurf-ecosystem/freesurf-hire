export type ToolStatus = 'Live' | 'Beta' | 'Planned';

export interface EcosystemTool {
  name: string;
  href?: string;
  host: string;
  status: ToolStatus;
  description: string;
}

export const ECOSYSTEM_TOOLS: EcosystemTool[] = [
  {
    name: 'Invoices',
    href: 'https://invoices.freesurf.tools',
    host: 'invoices.freesurf.tools',
    status: 'Live',
    description: 'Create and send free invoices.',
  },
  {
    name: 'Link-in-bio',
    href: 'https://links.freesurf.tools',
    host: 'links.freesurf.tools',
    status: 'Live',
    description: 'One link-in-bio page for everything you do.',
  },
  {
    name: 'Post',
    href: 'https://post.freesurf.tools',
    host: 'post.freesurf.tools',
    status: 'Beta',
    description: 'Cross-post to your networks at once.',
  },
  {
    name: 'Transcriber',
    href: 'https://transcribe.freesurf.tools',
    host: 'transcribe.freesurf.tools',
    status: 'Live',
    description: 'Record, transcribe, and summarize audio.',
  },
  {
    name: 'Reader',
    href: 'https://reader.freesurf.tools',
    host: 'reader.freesurf.tools',
    status: 'Live',
    description: 'A distraction-free reader with read-aloud.',
  },
  {
    name: 'AI Calorie Tracker',
    href: 'https://calories.freesurf.tools',
    host: 'calories.freesurf.tools',
    status: 'Live',
    description: 'Snap a photo to track calories.',
  },
];

export const ECOSYSTEM_GITHUB = 'https://github.com/freesurf-ecosystem';
