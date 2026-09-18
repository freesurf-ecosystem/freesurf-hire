import { Contractor } from '../types';

export interface BreadcrumbItem {
  name: string;
  url: string;
}

const BASE_URL = 'https://freesurf.tools';

// Helper function to escape JSON strings for safe insertion into script tags
export function escapeJsonString(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
}

// Generate Organization schema for FreeSurf
export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "FreeSurf",
    "url": BASE_URL,
    "logo": `${BASE_URL}/logo-black.svg`,
    "description": "FreeSurf is a free, open-source platform connecting clients and contractors directly. No lead fees, no commissions.",
    "sameAs": [],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Customer Service",
      "areaServed": "US"
    }
  };
}

// Generate WebSite schema with SearchAction
export function generateWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "FreeSurf",
    "url": BASE_URL,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${BASE_URL}/{service}`
      },
      "query-input": [
        {
          "@type": "PropertyValueSpecification",
          "valueName": "service",
          "valueRequired": true
        }
      ]
    }
  };
}

// Generate BreadcrumbList schema
export function generateBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };
}

// Generate detailed contractor schema for individual cards
export function generateContractorSchema(contractor: Contractor) {
  const schema: any = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${BASE_URL}/contractor/${contractor.id}`,
    "name": contractor.company || contractor.name,
    "description": contractor.bio,
    "telephone": contractor.phone,
    "email": contractor.email
  };

  // Add rating and reviews
  if (contractor.rating > 0) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": contractor.rating.toFixed(1),
      "reviewCount": contractor.reviewCount,
      "bestRating": "5",
      "worstRating": "1"
    };
  }

  // Add individual reviews if available
  if (contractor.reviews && contractor.reviews.length > 0) {
    schema.review = contractor.reviews.slice(0, 5).map((review: any) => ({
      "@type": "Review",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": review.rating,
        "bestRating": "5",
        "worstRating": "1"
      },
      "author": {
        "@type": "Person",
        "name": review.author_name || review.authorName || "Anonymous"
      },
      "reviewBody": review.text,
      "datePublished": review.time ? new Date(review.time * 1000).toISOString() : undefined
    }));
  }

  // Add address if zip code is available
  if (contractor.base_zip_code) {
    schema.address = {
      "@type": "PostalAddress",
      "postalCode": contractor.base_zip_code,
      "addressCountry": "US"
    };
  }

  // Add the areas this contractor serves
  const serviceAreas = contractor.service_areas || contractor.location_preferences?.states || [];
  if (serviceAreas.length > 0) {
    schema.areaServed = serviceAreas.map((area: string) => ({
      "@type": "Place",
      "name": area
    }));
  }

  // Add website if available
  if (contractor.website) {
    schema.url = contractor.website;
  }

  // Add services offered
  if (contractor.specialties && contractor.specialties.length > 0) {
    schema.knowsAbout = contractor.specialties;
    schema.makesOffer = contractor.specialties.map((service: string) => ({
      "@type": "Offer",
      "itemOffered": {
        "@type": "Service",
        "name": service
      }
    }));
  }

  return schema;
}

// Generate Article schema for blog posts and resources
export function generateArticleSchema(options: {
  headline: string;
  description: string;
  datePublished: string;
  dateModified?: string;
  authorName?: string;
  articleBody?: string;
  url: string;
  imageUrl?: string;
  keywords?: string[];
}) {
  const {
    headline,
    description,
    datePublished,
    dateModified,
    authorName = "FreeSurf Editorial Team",
    articleBody,
    url,
    imageUrl,
    keywords = []
  } = options;

  const schema: any = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": headline,
    "description": description,
    "datePublished": datePublished,
    "dateModified": dateModified || datePublished,
    "author": {
      "@type": "Organization",
      "name": authorName,
      "url": BASE_URL
    },
    "publisher": {
      "@type": "Organization",
      "name": "FreeSurf",
      "url": BASE_URL,
      "logo": {
        "@type": "ImageObject",
        "url": `${BASE_URL}/logo-black.svg`
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": url
    }
  };

  if (articleBody) {
    schema.articleBody = articleBody;
  }

  if (imageUrl) {
    schema.image = {
      "@type": "ImageObject",
      "url": imageUrl
    };
  }

  if (keywords.length > 0) {
    schema.keywords = keywords.join(", ");
  }

  return schema;
}

// Generate WebPage schema for service/landing pages
export function generateWebPageSchema(options: {
  name: string;
  description: string;
  url: string;
  breadcrumbs?: BreadcrumbItem[];
}) {
  const { name, description, url, breadcrumbs } = options;

  const schema: any = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": name,
    "description": description,
    "url": url,
    "isPartOf": {
      "@type": "WebSite",
      "name": "FreeSurf",
      "url": BASE_URL
    },
    "publisher": {
      "@type": "Organization",
      "name": "FreeSurf",
      "url": BASE_URL
    }
  };

  if (breadcrumbs && breadcrumbs.length > 0) {
    schema.breadcrumb = generateBreadcrumbSchema(breadcrumbs);
  }

  return schema;
}

// Inject schema into document head
export function injectSchema(schema: any, id: string) {
  // Remove existing schema with this ID
  const existing = document.getElementById(id);
  if (existing) {
    existing.remove();
  }

  // Create new script tag
  const script = document.createElement('script');
  script.id = id;
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(schema, null, 2);
  document.head.appendChild(script);
}

// Remove schema from document head
export function removeSchema(id: string) {
  const existing = document.getElementById(id);
  if (existing) {
    existing.remove();
  }
}
