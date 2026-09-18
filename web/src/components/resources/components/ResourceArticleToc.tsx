import { resourceArticleStyles } from './resourceArticleStyles';

const TOC_HEADING_SELECTOR = 'h2, h3';
const TOC_IGNORE_SCOPE_SELECTOR = '[data-toc-ignore-scope="true"]';

export interface ResourceArticleTocItem {
  href: string;
  label: string;
  children?: ResourceArticleTocItem[];
}

function createTocSlug(value: string, usedIds: Set<string>) {
  const baseSlug = value
    .toLowerCase()
    .replace(/["']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'section';

  let slug = baseSlug;
  let suffix = 2;

  while (usedIds.has(slug)) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return slug;
}

export function buildResourceArticleTocItems(root: HTMLElement): ResourceArticleTocItem[] {
  const headings = Array.from(root.querySelectorAll<HTMLHeadingElement>(TOC_HEADING_SELECTOR)).filter(
    (heading) => !heading.closest(TOC_IGNORE_SCOPE_SELECTOR),
  );
  const usedIds = new Set<string>();
  const items: ResourceArticleTocItem[] = [];
  let currentParent: ResourceArticleTocItem | null = null;

  headings.forEach((heading) => {
    const label = heading.dataset.tocLabel?.trim() || heading.textContent?.trim() || '';

    if (!label) {
      return;
    }

    const existingId = heading.id.trim();
    const id = existingId && !usedIds.has(existingId)
      ? existingId
      : createTocSlug(existingId || label, usedIds);

    heading.id = id;
    usedIds.add(id);

    const item: ResourceArticleTocItem = {
      href: `#${id}`,
      label,
    };

    if (heading.tagName === 'H3' && currentParent) {
      currentParent.children = [...(currentParent.children || []), item];
      return;
    }

    items.push(item);
    currentParent = item;
  });

  return items;
}

interface ResourceArticleTocProps {
  items: ResourceArticleTocItem[];
  title?: string;
}

export default function ResourceArticleToc({
  items,
  title = 'On This Page',
}: ResourceArticleTocProps) {
  return (
    <nav aria-label="Table of contents" className={resourceArticleStyles.tocCard}>
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-900">{title}</h3>
      <ul className={resourceArticleStyles.tocList}>
        {items.map((item) => (
          <li key={item.href}>
            <a href={item.href} className={resourceArticleStyles.tocLink}>{item.label}</a>
            {item.children && item.children.length > 0 && (
              <ul className={resourceArticleStyles.tocNestedList}>
                {item.children.map((child) => (
                  <li key={child.href}>
                    <a href={child.href} className={resourceArticleStyles.tocSubLink}>{child.label}</a>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}