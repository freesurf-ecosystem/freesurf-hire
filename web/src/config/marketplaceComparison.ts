/**
 * How FreeSurf compares to traditional contractor marketplaces.
 *
 * Shared so the homepage and the "join as a contractor" page can't drift apart.
 * `us` / `them` are the SVG graphics in public/graphics, rendered through the
 * Graphic component (tinted by the surrounding text colour).
 */
export interface MarketplaceComparisonRow {
  concept: string;
  us: string;
  them: string;
  freesurf: string;
  other: string;
}

export const MARKETPLACE_COMPARISON: MarketplaceComparisonRow[] = [
  {
    concept: 'Fees',
    us: '/graphics/arrow-up.svg',
    them: '/graphics/arrow-down.svg',
    freesurf: 'No lead fees or commissions on contractor work',
    other:
      'Contractors pay hidden lead fees to have conversations with clients that hurt their margins or take commission cuts to their payments (re: Thumbtack, Angi, Upwork, Fiverr)',
  },
  {
    concept: 'Direct contact',
    us: '/graphics/phone-plus.svg',
    them: '/graphics/phone-missed.svg',
    freesurf: 'Speak directly with a contractor, via their own email or phone, no strings attached',
    other:
      'You typically cannot share contact information, and can be banned for trying (re: Upwork or TaskRabbit)',
  },
  {
    concept: 'Payment',
    us: '/graphics/handshake.svg',
    them: '/graphics/piggy-bank.svg',
    freesurf: 'Handle payment in the best way you see fit',
    other:
      'You must use the payment system of the app to pay a contractor; ie there is no flexibility, preference or input about payment processors (re: Upwork, Fiverr, TaskRabbit)',
  },
  {
    concept: 'Support',
    us: '/graphics/happy-emoji.svg',
    them: '/graphics/fingers-crossed.svg',
    freesurf: 'Have fun with the process',
    other: 'You are promised support, but it is underwhelming (re: Thumbtack)',
  },
];
