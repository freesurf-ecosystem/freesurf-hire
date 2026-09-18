import { resourceArticleStyles } from './resourceArticleStyles';

export interface ResourceArticleSummaryItem {
  href: string;
  title: string;
  description: string;
}

interface ResourceArticleSummaryProps {
  title: string;
  items: ResourceArticleSummaryItem[];
}

export default function ResourceArticleSummary({ title, items }: ResourceArticleSummaryProps) {
  return (
    <div className={resourceArticleStyles.heroCard} data-toc-ignore-scope="true">
      <div className={resourceArticleStyles.heroInner}>
        <div className={resourceArticleStyles.summaryCard}>
          <h2 className="mb-4 text-xl font-bold text-gray-900">{title}</h2>
          <ul className={resourceArticleStyles.summaryList}>
            {items.map((item, index) => (
              <li key={item.href} className={resourceArticleStyles.summaryItem}>
                <span className="shrink-0 font-semibold text-blue-600">{index + 1}.</span>
                <div className="min-w-0">
                  <a href={item.href} className="block break-words font-semibold text-blue-600 hover:underline">{item.title}</a>
                  <p className="mt-1 text-sm text-gray-600">{item.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}