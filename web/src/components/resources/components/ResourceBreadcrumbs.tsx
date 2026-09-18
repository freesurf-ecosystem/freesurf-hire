import { ChevronRight } from 'lucide-react';

interface ResourceBreadcrumbsProps {
  sectionLabel: string;
  sectionHref: string;
  currentLabel: string;
}

export default function ResourceBreadcrumbs({
  sectionLabel,
  sectionHref,
  currentLabel,
}: ResourceBreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-5 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
      <ol className="flex flex-wrap items-center gap-2 text-sm text-gray-700">
        <li>
          <a href="/resources" className="font-medium text-blue-700 hover:text-blue-800 transition-colors">
            Resources
          </a>
        </li>
        <li aria-hidden="true" className="text-gray-400">
          <ChevronRight className="h-4 w-4" />
        </li>
        <li>
          <a href={sectionHref} className="font-medium text-blue-700 hover:text-blue-800 transition-colors">
            {sectionLabel}
          </a>
        </li>
        <li aria-hidden="true" className="text-gray-400">
          <ChevronRight className="h-4 w-4" />
        </li>
        <li className="text-gray-900 font-medium">{currentLabel}</li>
      </ol>
    </nav>
  );
}
