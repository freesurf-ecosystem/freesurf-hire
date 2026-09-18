import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ChevronSectionProps {
  title: string;
  description: string;
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  items: Array<{
    id: string | number;
    label: string;
    onClick?: () => void;
    href?: string;
  }>;
  gridCols?: 'grid-cols-5' | 'grid-cols-6';
  bgColor?: 'bg-white' | 'bg-gray-100';
}

export const ChevronSection: React.FC<ChevronSectionProps> = ({
  title,
  description,
  isOpen,
  setIsOpen,
  items,
  gridCols = 'grid-cols-6',
  bgColor = 'bg-white'
}) => {
  return (
    <div className={`${bgColor} py-8`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-4">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center justify-center w-full text-2xl font-bold text-gray-900 mb-2 hover:text-blue-600 transition-colors"
          >
            <span>{title}</span>
            {isOpen ? (
              <ChevronUp className="h-6 w-6 ml-4 flex-shrink-0" />
            ) : (
              <ChevronDown className="h-6 w-6 ml-4 flex-shrink-0" />
            )}
          </button>
          <p className="text-gray-600 max-w-3xl mx-auto">
            {description}
          </p>
        </div>

        {isOpen && (
          <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:${gridCols} gap-3 animate-in slide-in-from-top duration-300`}>
            {items.map((item) =>
              item.href ? (
                <a
                  key={item.id}
                  href={item.href}
                  className="group bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 text-center"
                >
                  <span className="inline-block transition-transform duration-200 group-hover:scale-105 group-hover:text-blue-700">
                    {item.label}
                  </span>
                </a>
              ) : (
                <button
                  key={item.id}
                  onClick={item.onClick}
                  className="group bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 text-center"
                >
                  <span className="inline-block transition-transform duration-200 group-hover:scale-105 group-hover:text-blue-700">
                    {item.label}
                  </span>
                </button>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};
