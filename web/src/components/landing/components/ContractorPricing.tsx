import React from 'react';

interface PricingTier {
  name: string;
  price: string;
  description: string;
  features: string[];
  cta: string;
  onCtaClick: () => void;
  highlighted?: boolean;
}

interface ContractorPricingProps {
  title: string;
  subtitle?: string;
  tiers: PricingTier[];
}

export const ContractorPricing: React.FC<ContractorPricingProps> = ({
  title,
  subtitle,
  tiers
}) => {
  return (
    <section className="py-16 sm:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            {title}
          </h2>
          {subtitle && (
            <p className="text-lg text-gray-600">
              {subtitle}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tiers.map((tier, idx) => (
            <div
              key={idx}
              className={`rounded-lg overflow-hidden transition-all ${
                tier.highlighted
                  ? 'ring-2 ring-blue-500 lg:scale-105'
                  : 'ring-1 ring-gray-200'
              } ${tier.highlighted ? 'bg-white' : 'bg-white'}`}
            >
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {tier.name}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {tier.description}
                </p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">
                    {tier.price}
                  </span>
                </div>
                <ul className="space-y-4 mb-8">
                  {tier.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-start">
                      <span className="text-blue-500 mr-3">✓</span>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={tier.onCtaClick}
                  className={`w-full py-2 px-4 rounded-lg font-semibold transition-colors ${
                    tier.highlighted
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {tier.cta}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
