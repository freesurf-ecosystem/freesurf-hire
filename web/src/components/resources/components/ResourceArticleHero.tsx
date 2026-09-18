import { Calendar, Clock, Tag } from 'lucide-react';
import { resourceArticleStyles } from './resourceArticleStyles';

interface ResourceArticleHeroProps {
  tags: string[];
  readTime: string;
  updatedDate: string;
  title: string;
  description?: string;
}

export default function ResourceArticleHero({
  tags,
  readTime,
  updatedDate,
  title,
  description,
}: ResourceArticleHeroProps) {
  return (
    <div className={resourceArticleStyles.heroCard}>
      <div className={resourceArticleStyles.heroInner}>
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
            >
              <Tag className="h-3 w-3 mr-1" />
              {tag}
            </span>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mb-4 text-sm text-gray-500">
          <span className="inline-flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            {readTime}
          </span>
          <span className="inline-flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            Updated {updatedDate}
          </span>
        </div>

        <h1 className="break-words text-3xl font-bold leading-tight text-gray-900 md:text-4xl">
          {title}
        </h1>

        {description && (
          <p className="mt-4 break-words text-lg text-gray-600">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
