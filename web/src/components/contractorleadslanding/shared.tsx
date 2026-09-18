import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, CheckCircle, type LucideIcon } from 'lucide-react';
import Footer from '../Layout/Footer';

type NavigateHandler = (path: string) => void;
type RevealVariant = 'up' | 'left' | 'right' | 'scale';

interface JsonLdSchema {
  id: string;
  data: Record<string, unknown>;
}

interface LeadHeroSignalCard {
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
  tone: 'warm' | 'teal' | 'dark';
}

interface LeadFeatureCard {
  icon: LucideIcon;
  title: string;
  description: string;
}

interface LeadComparisonCard {
  title: string;
  pricing: string;
  fit: string;
  tradeoff: string;
  featured?: boolean;
}

interface LeadProcessStep {
  step: string;
  title: string;
  description: string;
}

interface LeadSpotlightCard {
  icon: LucideIcon;
  title: string;
  description: string;
}

interface LeadInfoCard {
  title: string;
  description: string;
}

interface LeadServiceCard {
  title: string;
  description: string;
  href: string;
}

interface LeadPageFrameProps {
  navigate: NavigateHandler;
  children: React.ReactNode;
}

interface LeadHeroSectionProps {
  eyebrow: string;
  title: string;
  accentTitle?: string;
  description: string;
  signals: string[];
  primaryActionLabel: string;
  onPrimaryAction: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  snapshotLabel: string;
  snapshotTitle: string;
  snapshotBadge: string;
  snapshotCards: LeadHeroSignalCard[];
}

interface LeadFeatureStripSectionProps {
  cards: LeadFeatureCard[];
}

interface LeadComparisonSectionProps {
  eyebrow: string;
  title: string;
  description: string;
  cards: LeadComparisonCard[];
  actionLabel?: string;
  onAction?: () => void;
}

interface LeadProcessSectionProps {
  eyebrow: string;
  title: string;
  steps: LeadProcessStep[];
}

interface LeadPricingSectionProps {
  eyebrow: string;
  title: string;
  description: string;
  bullets: string[];
}

interface LeadServiceGridSectionProps {
  eyebrow: string;
  title: string;
  description: string;
  cards: LeadServiceCard[];
  navigate: NavigateHandler;
}

interface LeadSpotlightSectionProps {
  eyebrow: string;
  title: string;
  description: string;
  cards: LeadSpotlightCard[];
  panelEyebrow: string;
  panelTitle: string;
  panelCards: LeadInfoCard[];
  panelTheme?: 'dark' | 'light';
}

interface LeadFinalCtaSectionProps {
  eyebrow: string;
  title: string;
  description: string;
  primaryActionLabel: string;
  onPrimaryAction: () => void;
  secondaryActionLabel: string;
  onSecondaryAction: () => void;
}

interface UseLeadLandingMetadataOptions {
  title: string;
  description: string;
  schemas: JsonLdSchema[];
}

interface RevealOnScrollProps {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
  durationMs?: number;
  variant?: RevealVariant;
}

interface AnimatedHeadlineProps {
  eyebrow: string;
  title: string;
  accentTitle?: string;
  description: string;
}

function getRevealTransform(variant: RevealVariant) {
  switch (variant) {
    case 'left':
      return '-translate-x-8';
    case 'right':
      return 'translate-x-8';
    case 'scale':
      return 'scale-[0.985]';
    case 'up':
    default:
      return 'translate-y-8';
  }
}

function getHeroCardClasses(tone: LeadHeroSignalCard['tone']) {
  if (tone === 'teal') {
    return {
      wrapper: 'ml-6 rounded-2xl border border-[#d8ebe5] bg-[#f3faf8] p-5 shadow-sm',
      eyebrow: 'text-teal-700',
      iconWrapper: 'rounded-2xl border border-[#bfe2d9] bg-white p-3 text-teal-700',
      body: 'text-slate-600',
    };
  }

  if (tone === 'dark') {
    return {
      wrapper: 'rounded-2xl border border-slate-900 bg-slate-950 p-5 text-white shadow-lg',
      eyebrow: 'text-slate-300',
      iconWrapper: 'rounded-2xl border border-white/15 bg-white/10 p-3 text-[#f1c48d]',
      body: 'text-slate-300',
    };
  }

  return {
    wrapper: 'rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-sm',
    eyebrow: 'text-[#8f5c22]',
    iconWrapper: 'rounded-2xl border border-[#dcc8a8] bg-white p-3 text-[#8f5c22]',
    body: 'text-slate-600',
  };
}

export function useLeadLandingMetadata({ title, description, schemas }: UseLeadLandingMetadataOptions) {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    document.title = title;

    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', description);

    schemas.forEach(({ id }) => {
      const existing = document.getElementById(id);
      if (existing) existing.remove();
    });

    const createdScripts = schemas.map(({ id, data }) => {
      const script = document.createElement('script');
      script.id = id;
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(data, null, 2);
      document.head.appendChild(script);
      return script;
    });

    return () => {
      createdScripts.forEach((script) => script.remove());
    };
  }, [description, schemas, title]);
}

export function RevealOnScroll({
  children,
  className = '',
  delayMs = 0,
  durationMs = 720,
  variant = 'up',
}: RevealOnScrollProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setIsVisible(true);
      return;
    }

    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.18 }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delayMs}ms`, transitionDuration: `${durationMs}ms` }}
      className={[
        'transition-all ease-out will-change-transform',
        isVisible ? 'translate-x-0 translate-y-0 scale-100 opacity-100' : `${getRevealTransform(variant)} opacity-0`,
        className,
      ].join(' ')}
    >
      {children}
    </div>
  );
}

function AnimatedHeadline({ eyebrow, title, accentTitle, description }: AnimatedHeadlineProps) {
  return (
    <div className="max-w-3xl">
      <RevealOnScroll variant="up" delayMs={0} durationMs={640}>
        <div className="inline-flex items-center rounded-full border border-[#dcc8a8] bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#8f5c22] shadow-sm backdrop-blur">
          {eyebrow}
        </div>
      </RevealOnScroll>
      <h1 className="mt-6 text-4xl font-bold leading-tight text-slate-950 md:text-6xl">
        <RevealOnScroll variant="up" delayMs={80} durationMs={760}>
          <span className="block">{title}</span>
        </RevealOnScroll>
        {accentTitle ? (
          <RevealOnScroll variant="up" delayMs={160} durationMs={760}>
            <span className="mt-1 block text-[#8f5c22]">{accentTitle}</span>
          </RevealOnScroll>
        ) : null}
      </h1>
      <RevealOnScroll variant="up" delayMs={240} durationMs={760}>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 md:text-xl">
          {description}
        </p>
      </RevealOnScroll>
    </div>
  );
}

export function LeadPageFrame({ navigate, children }: LeadPageFrameProps) {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      {children}
      <Footer navigate={navigate} />
    </div>
  );
}

export function LeadHeroSection({
  eyebrow,
  title,
  accentTitle,
  description,
  signals,
  primaryActionLabel,
  onPrimaryAction,
  secondaryActionLabel,
  onSecondaryAction,
  snapshotLabel,
  snapshotTitle,
  snapshotBadge,
  snapshotCards,
}: LeadHeroSectionProps) {
  return (
    <section className="relative overflow-hidden border-b border-slate-200 bg-white">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent opacity-90" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <RevealOnScroll>
            <div>
              <AnimatedHeadline
                eyebrow={eyebrow}
                title={title}
                accentTitle={accentTitle}
                description={description}
              />
              <div className="mt-8 flex flex-wrap gap-3">
                {signals.map((signal, index) => (
                  <RevealOnScroll key={signal} variant="up" delayMs={320 + index * 80} durationMs={620}>
                    <div className="rounded-full border border-[#dfd6c6] bg-white/85 px-4 py-2 text-sm text-slate-700 shadow-sm">
                      {signal}
                    </div>
                  </RevealOnScroll>
                ))}
              </div>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <RevealOnScroll variant="up" delayMs={480} durationMs={620}>
                  <button
                    onClick={onPrimaryAction}
                    className="inline-flex items-center justify-center rounded-xl bg-slate-950 px-7 py-4 text-lg font-semibold text-white transition-transform hover:-translate-y-0.5 hover:bg-slate-800"
                  >
                    {primaryActionLabel}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </button>
                </RevealOnScroll>
                {secondaryActionLabel && onSecondaryAction ? (
                  <RevealOnScroll variant="up" delayMs={560} durationMs={620}>
                    <button
                      onClick={onSecondaryAction}
                      className="inline-flex items-center justify-center rounded-xl border border-[#d8c7ae] bg-white px-7 py-4 text-lg font-semibold text-slate-800 transition-transform hover:-translate-y-0.5 hover:border-[#c67b2b] hover:text-[#8f5c22]"
                    >
                      {secondaryActionLabel}
                    </button>
                  </RevealOnScroll>
                ) : null}
              </div>
            </div>
          </RevealOnScroll>

          <RevealOnScroll className="lg:pl-6" variant="right" delayMs={180} durationMs={820}>
            <div className="relative mx-auto max-w-xl">
              <div className="absolute -left-8 top-10 hidden h-32 w-32 rounded-full bg-[#eef6f8] blur-3xl lg:block" />
              <div className="absolute -right-6 bottom-10 hidden h-36 w-36 rounded-full bg-[#eef2f8] blur-3xl lg:block" />
              <div className="relative overflow-hidden rounded-[30px] border border-[#dfd6c6] bg-white/88 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.08)] backdrop-blur">
                <div className="flex items-center justify-between border-b border-[#ece4d8] pb-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{snapshotLabel}</p>
                    <h2 className="mt-2 text-2xl font-bold text-slate-950">{snapshotTitle}</h2>
                  </div>
                  <div className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600">
                    {snapshotBadge}
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  {snapshotCards.map((card, index) => {
                    const { wrapper, eyebrow: eyebrowClass, iconWrapper, body } = getHeroCardClasses(card.tone);
                    const Icon = card.icon;

                    return (
                      <RevealOnScroll
                        key={card.title}
                        className={wrapper}
                        variant={index % 2 === 0 ? 'left' : 'right'}
                        delayMs={260 + index * 110}
                        durationMs={760}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${eyebrowClass}`}>{card.eyebrow}</p>
                            <h3 className="mt-2 text-lg font-semibold text-slate-900">{card.title}</h3>
                            <p className={`mt-2 text-sm leading-6 ${body}`}>{card.description}</p>
                          </div>
                          <div className={iconWrapper}>
                            <Icon className="h-6 w-6" />
                          </div>
                        </div>
                      </RevealOnScroll>
                    );
                  })}
                </div>
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
}

export function LeadFeatureStripSection({ cards }: LeadFeatureStripSectionProps) {
  return (
    <section className="py-12 border-b border-slate-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {cards.map(({ icon: Icon, title, description }, index) => (
            <RevealOnScroll key={title} variant="up" delayMs={index * 90} durationMs={680}>
              <div className="h-full rounded-3xl border border-[#e7dfd2] bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#dcc8a8] bg-white text-[#8f5c22]">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-xl font-semibold text-slate-950">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}

export function LeadComparisonSection({
  eyebrow,
  title,
  description,
  cards,
  actionLabel,
  onAction,
}: LeadComparisonSectionProps) {
  return (
    <section className="py-20 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <RevealOnScroll className="text-center max-w-4xl mx-auto">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#8f5c22]">{eyebrow}</p>
          <h2 className="mt-4 text-3xl font-bold text-slate-950 md:text-5xl">{title}</h2>
          <p className="mt-5 text-lg leading-8 text-slate-600">{description}</p>
        </RevealOnScroll>

        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {cards.map((card, index) => (
            <RevealOnScroll key={card.title} variant={index === 1 ? 'up' : index === 0 ? 'left' : 'right'} delayMs={index * 90} durationMs={720}>
              <div className={`h-full rounded-[28px] border p-7 shadow-[0_20px_60px_rgba(15,23,42,0.06)] ${
                card.featured ? 'border-slate-900 bg-slate-950 text-white' : 'border-[#e2d8c8] bg-white text-slate-900'
              }`}>
                <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${card.featured ? 'text-[#f1c48d]' : 'text-slate-500'}`}>
                  {card.title}
                </p>
                <h3 className="mt-4 text-2xl font-bold">{card.pricing}</h3>
                <div className={`mt-6 space-y-4 text-sm leading-7 ${card.featured ? 'text-slate-200' : 'text-slate-600'}`}>
                  <p><strong className={card.featured ? 'text-white' : 'text-slate-900'}>Best fit:</strong> {card.fit}</p>
                  <p><strong className={card.featured ? 'text-white' : 'text-slate-900'}>Tradeoff:</strong> {card.tradeoff}</p>
                </div>
              </div>
            </RevealOnScroll>
          ))}
        </div>

        {actionLabel && onAction ? (
          <RevealOnScroll className="mt-8 flex justify-center">
            <button
              onClick={onAction}
              className="rounded-full border border-[#d8c7ae] bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition-colors hover:border-[#c67b2b] hover:text-[#8f5c22]"
            >
              {actionLabel}
            </button>
          </RevealOnScroll>
        ) : null}
      </div>
    </section>
  );
}

export function LeadProcessSection({ eyebrow, title, steps }: LeadProcessSectionProps) {
  return (
    <section className="py-20 bg-white border-b border-[#ebe4d8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <RevealOnScroll className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#8f5c22]">{eyebrow}</p>
          <h2 className="mt-4 text-3xl font-bold text-slate-950 md:text-5xl">{title}</h2>
        </RevealOnScroll>

        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {steps.map((step, index) => (
            <RevealOnScroll key={step.step} variant="up" delayMs={index * 90} durationMs={680}>
              <div className="h-full rounded-3xl border border-[#e7dfd2] bg-white p-7 shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
                <div className="text-sm font-semibold uppercase tracking-[0.22em] text-[#8f5c22]">{step.step}</div>
                <h3 className="mt-4 text-2xl font-semibold text-slate-950">{step.title}</h3>
                <p className="mt-4 text-sm leading-7 text-slate-600">{step.description}</p>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}

export function LeadPricingSection({
  eyebrow,
  title,
  description,
  bullets,
}: LeadPricingSectionProps) {
  return (
    <section className="py-20 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10">
          <RevealOnScroll variant="left" delayMs={60} durationMs={720}>
            <div className="max-w-xl">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-teal-700">{eyebrow}</p>
              <h2 className="mt-4 text-3xl font-bold text-slate-950 md:text-5xl">{title}</h2>
              <p className="mt-5 text-lg leading-8 text-slate-600">{description}</p>

              <div className="mt-8 space-y-4 rounded-[28px] border border-[#d8ebe5] bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
                {bullets.map((bullet) => (
                  <div key={bullet} className="flex items-start gap-3">
                    <CheckCircle className="mt-1 h-5 w-5 text-teal-700" />
                    <p className="text-sm leading-7 text-slate-600">{bullet}</p>
                  </div>
                ))}
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
}

export function LeadServiceGridSection({
  eyebrow,
  title,
  description,
  cards,
  navigate,
}: LeadServiceGridSectionProps) {
  return (
    <section className="py-20 bg-white border-b border-[#ebe4d8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <RevealOnScroll className="max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#8f5c22]">{eyebrow}</p>
          <h2 className="mt-4 text-3xl font-bold text-slate-950 md:text-5xl">{title}</h2>
          <p className="mt-5 text-lg leading-8 text-slate-600">{description}</p>
        </RevealOnScroll>

        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {cards.map((card, index) => (
            <RevealOnScroll key={card.href} variant={index % 3 === 0 ? 'left' : index % 3 === 1 ? 'up' : 'right'} delayMs={Math.min(index * 45, 220)} durationMs={700}>
              <a
                href={card.href}
                onClick={(event) => {
                  event.preventDefault();
                  navigate(card.href);
                }}
                className="group block h-full w-full rounded-3xl border border-[#e7dfd2] bg-white p-6 text-left shadow-[0_18px_50px_rgba(15,23,42,0.05)] transition-transform hover:-translate-y-1 hover:border-[#c67b2b]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-950">{card.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-600">{card.description}</p>
                  </div>
                  <ArrowRight className="mt-1 h-5 w-5 shrink-0 text-[#8f5c22] transition-transform group-hover:translate-x-1" />
                </div>
              </a>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}

export function LeadSpotlightSection({
  eyebrow,
  title,
  description,
  cards,
  panelEyebrow,
  panelTitle,
  panelCards,
  panelTheme = 'dark',
}: LeadSpotlightSectionProps) {
  const darkPanel = panelTheme === 'dark';

  return (
    <section className="py-20 bg-white border-b border-[#ebe4d8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
          <RevealOnScroll variant="left" delayMs={60} durationMs={720}>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#8f5c22]">{eyebrow}</p>
              <h2 className="mt-4 text-3xl font-bold text-slate-950 md:text-5xl">{title}</h2>
              <p className="mt-5 text-lg leading-8 text-slate-600">{description}</p>

              <div className="mt-10 space-y-4">
                {cards.map(({ icon: Icon, title: cardTitle, description: cardDescription }, index) => (
                  <RevealOnScroll key={cardTitle} variant="left" delayMs={index * 90} durationMs={680}>
                    <div className="rounded-2xl border border-[#e7dfd2] bg-white p-5 shadow-sm">
                    <div className="flex items-start gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#dcc8a8] bg-white text-[#8f5c22]">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-950">{cardTitle}</h3>
                        <p className="mt-2 text-sm leading-7 text-slate-600">{cardDescription}</p>
                      </div>
                    </div>
                    </div>
                  </RevealOnScroll>
                ))}
              </div>
            </div>
          </RevealOnScroll>

          <RevealOnScroll variant="right" delayMs={140} durationMs={760}>
            <div className={`rounded-[30px] p-8 shadow-[0_28px_80px_rgba(15,23,42,0.14)] ${
              darkPanel ? 'border border-slate-900 bg-slate-950 text-white' : 'border border-[#e7dfd2] bg-white text-slate-900'
            }`}>
              <p className={`text-sm font-semibold uppercase tracking-[0.2em] ${darkPanel ? 'text-[#f1c48d]' : 'text-[#8f5c22]'}`}>
                {panelEyebrow}
              </p>
              <h3 className="mt-4 text-3xl font-bold">{panelTitle}</h3>
              <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
                {panelCards.map((card, index) => (
                  <RevealOnScroll key={card.title} variant="up" delayMs={index * 80} durationMs={660}>
                    <div
                      className={`rounded-2xl p-5 ${
                        darkPanel ? 'border border-white/10 bg-white/5' : 'border border-[#e7dfd2] bg-white'
                      }`}
                    >
                      <h4 className={`text-lg font-semibold ${darkPanel ? 'text-white' : 'text-slate-950'}`}>{card.title}</h4>
                      <p className={`mt-3 text-sm leading-7 ${darkPanel ? 'text-slate-300' : 'text-slate-600'}`}>{card.description}</p>
                    </div>
                  </RevealOnScroll>
                ))}
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
}

export function LeadFinalCtaSection({
  eyebrow,
  title,
  description,
  primaryActionLabel,
  onPrimaryAction,
  secondaryActionLabel,
  onSecondaryAction,
}: LeadFinalCtaSectionProps) {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <RevealOnScroll>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#8f5c22]">{eyebrow}</p>
          <h2 className="mt-4 text-3xl font-bold text-slate-950 md:text-5xl">{title}</h2>
          <p className="mt-6 text-lg leading-8 text-slate-600 md:text-xl">{description}</p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <button
              onClick={onPrimaryAction}
              className="inline-flex items-center justify-center rounded-xl bg-slate-950 px-8 py-4 text-lg font-semibold text-white transition-transform hover:-translate-y-0.5 hover:bg-slate-800"
            >
              {primaryActionLabel}
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
            <button
              onClick={onSecondaryAction}
              className="rounded-xl border border-[#d8c7ae] bg-white px-8 py-4 text-lg font-semibold text-slate-800 transition-transform hover:-translate-y-0.5 hover:border-[#c67b2b] hover:text-[#8f5c22]"
            >
              {secondaryActionLabel}
            </button>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}

export type {
  JsonLdSchema,
  LeadComparisonCard,
  LeadFeatureCard,
  LeadHeroSignalCard,
  LeadInfoCard,
  LeadProcessStep,
  LeadServiceCard,
  LeadSpotlightCard,
  NavigateHandler,
};