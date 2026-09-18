import React from 'react';
import { Building, MapPin, Users } from 'lucide-react';

interface ServiceLandingHeroProps {
  service: string;
  contractorCount: number;
  locationLabel?: string; // e.g., "Nationwide", "in California", "in San Francisco, California"
  description: string;
  stats?: Array<{
    icon: React.ReactNode;
    label: string;
  }>;
}

export const ServiceLandingHero: React.FC<ServiceLandingHeroProps> = ({
  service,
  contractorCount,
  locationLabel = 'Nationwide',
  description,
  stats
}) => {
  const normalizedLocationLabel = locationLabel === 'Nationwide'
    ? 'Nationwide'
    : locationLabel.replace(/^in\s+/i, 'in ');

  const defaultStats = [
    {
      icon: <Building className="h-5 w-5 mr-2 text-blue-600" />,
      label: service
    },
    {
      icon: <MapPin className="h-5 w-5 mr-2 text-blue-600" />,
      label: locationLabel
    },
    {
      icon: <Users className="h-5 w-5 mr-2 text-blue-600" />,
      label: `${contractorCount} Active Contractor${contractorCount !== 1 ? 's' : ''}`
    }
  ];

  const displayStats = stats || defaultStats;

  return (
    <div className="text-center mb-6">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
        {`Find ${service} ${normalizedLocationLabel}`}
      </h1>
      
      <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
        {description}
      </p>
      
      <div className="flex items-center justify-center space-x-6 text-sm text-gray-500 mb-2">
        {displayStats.map((stat, idx) => (
          <div key={idx} className="flex items-center">
            {stat.icon}
            <span>{stat.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
