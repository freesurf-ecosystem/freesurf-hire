import React from 'react';

interface BreadcrumbItem {
  name: string;
  url?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <div className="text-sm text-gray-600 mb-6 flex items-center justify-center flex-wrap gap-2">
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && <span>/</span>}
          {item.url ? (
            <a href={item.url} className="text-blue-600 hover:underline">
              {item.name}
            </a>
          ) : (
            <span className="font-semibold">{item.name}</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
