/**
 * Builds the public display name for a contractor profile.
 *
 * The public row never carries a full surname, so a personal profile is
 * published as "Jane D." and a business profile as the company name. The full
 * legal name lives in hire_contractor_private.
 */

export type NameDisplay = 'personal' | 'business';

export const NAME_DISPLAY_LABELS: Record<NameDisplay, string> = {
  personal: 'My name (first name and last initial)',
  business: 'My business name',
};

export const buildPersonalName = (firstName?: string | null, lastName?: string | null) => {
  const first = (firstName ?? '').trim();
  const last = (lastName ?? '').trim();
  if (!first) return last;
  if (!last) return first;
  return `${first} ${last.charAt(0).toUpperCase()}.`;
};

export const buildDisplayName = ({
  mode,
  firstName,
  lastName,
  company,
}: {
  mode: NameDisplay;
  firstName?: string | null;
  lastName?: string | null;
  company?: string | null;
}) => {
  const personal = buildPersonalName(firstName, lastName);
  const business = (company ?? '').trim();
  // A business profile with no company name entered still needs something to
  // show, so fall back to the personal form rather than publishing nothing.
  if (mode === 'business' && business) return business;
  return personal || business || null;
};
