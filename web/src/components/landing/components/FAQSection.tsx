import React, { useState } from 'react';
import { ChevronDown, ArrowRight } from 'lucide-react';
import { Link } from '../../../lib/navigation-compat';

interface FAQItem {
  question: string;
  answer: string;
  slug?: string; // Pre-calculated article slug (optional, generateSlug will be used as fallback)
}

interface FAQSectionProps {
  faqs: FAQItem[];
  title?: string;
  showArticleLinks?: boolean;
}

function generateSlug(question: string): string {
  // Remove location and state token references: {location}, {state}, or combinations
  let processedQuestion = question
    .replace(/\s+in\s+\{location\},\s*\{state\}/gi, '') // " in {location}, {state}"
    .replace(/\s+in\s+\{location\}/gi, '') // " in {location}"
    .replace(/\s+in\s+\{state\}/gi, '') // " in {state}"
    .replace(/\s+in\s+the\s+\{location\}\s+area/gi, ''); // " in the {location} area"

  // Map commercial property types to generic "commercial property"
  const commercialTypes = [
    'multi family apartment',
    'mobile home park',
    'commercial vacant land',
    'hotel',
    'warehouse',
    'small bay industrial',
    'storage facility',
    'flex space multi tenant retail',
    'single tenant retail',
    'shopping mall',
    'medical office',
    'hospital building',
    'airbnb or short term rental',
    'restaurant',
    'rv park',
    'industrial outdoor storage',
    'truck stop',
    'parking lot',
    'car wash',
    'laundromat',
    'laundry mat',
    'nursing homes assisted living'
  ];

  // Replace any commercial property type with "commercial property"
  for (const commercialType of commercialTypes) {
    if (processedQuestion.toLowerCase().includes(commercialType)) {
      processedQuestion = processedQuestion.toLowerCase().replace(commercialType, 'commercial property');
      break;
    }
  }

  return processedQuestion
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function getArticleLinkLabel(question: string): string {
  if (/\bopendoor\b/i.test(question)) {
    return 'See the full Opendoor breakdown';
  }

  if (/\bzillow\b|zestimate/i.test(question)) {
    return 'See the full Zillow analysis';
  }

  if (/lawyer|legal|illegal/i.test(question)) {
    return 'See the full legal breakdown';
  }

  if (/cash offer|cash buyer|sell .* for cash/i.test(question)) {
    return 'See the full cash-offer guide';
  }

  if (/value|devalue|pricing|worth/i.test(question)) {
    return 'See the full pricing breakdown';
  }

  return 'See the full guide';
}

// Function to parse markdown links and convert to JSX
function parseMarkdownLinks(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  // Regex to match markdown links: [text](url)
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let lastIndex = 0;
  let match;

  while ((match = linkRegex.exec(text)) !== null) {
    // Add text before the link
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    // Add the link as a clickable element
    const linkText = match[1];
    const linkUrl = match[2];
    parts.push(
      <a
        key={match.index}
        href={linkUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:text-blue-800 underline"
      >
        {linkText}
      </a>
    );

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text after the last link
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}

export default function FAQSection({ faqs, title = "Frequently Asked Questions", showArticleLinks = true }: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="bg-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {title}
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
              >
                <h3 className="text-xl font-semibold text-gray-900 pr-4">
                  {faq.question}
                </h3>
                <ChevronDown
                  className={`h-6 w-6 text-gray-500 flex-shrink-0 transition-transform duration-200 ${
                    openIndex === index ? 'transform rotate-180' : ''
                  }`}
                />
              </button>

              {openIndex === index && (
                <div className="px-6 pb-6">
                  <div className="text-gray-700 leading-relaxed whitespace-pre-line mb-4">
                    {parseMarkdownLinks(faq.answer)}
                  </div>
                  {showArticleLinks && (
                    <Link
                      href={`/resources/${faq.slug || generateSlug(faq.question)}`}
                      className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors"
                    >
                      {getArticleLinkLabel(faq.question)}
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Link>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
