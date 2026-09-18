import React from 'react';
import { ArrowRight } from 'lucide-react';

interface ContractorHeroProps {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaOnClick: () => void;
  propertyTypeName?: string;
}

export const ContractorHero: React.FC<ContractorHeroProps> = ({
  title,
  subtitle,
  ctaText,
  ctaOnClick,
  propertyTypeName
}) => {
  return (
    <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold mb-6">
          {title}
        </h1>
        <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
          {subtitle}
        </p>
        <button
          onClick={ctaOnClick}
          className="inline-flex items-center px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
        >
          {ctaText}
          <ArrowRight className="ml-2 h-5 w-5" />
        </button>
      </div>
    </section>
  );
};
