import React from 'react';

// Every asset in /public/graphics is from SVG Repo. The credit is emitted as a
// data attribute on each graphic so it stays in the markup without being shown.
const CREDIT = 'Vectors and icons by SVG Repo (https://www.svgrepo.com)';

interface GraphicProps {
  src: string;
  className?: string;
}

/**
 * Renders a monochrome SVG through a CSS mask so it picks up the surrounding
 * text colour. Lets one asset serve both the FreeSurf (blue) and other
 * marketplace (gray) sides of a comparison.
 */
export default function Graphic({ src, className }: GraphicProps) {
  return (
    <span
      aria-hidden="true"
      data-credit={CREDIT}
      className={className}
      style={{
        display: 'inline-block',
        backgroundColor: 'currentColor',
        WebkitMaskImage: `url("${src}")`,
        maskImage: `url("${src}")`,
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
        maskPosition: 'center',
        WebkitMaskSize: 'contain',
        maskSize: 'contain',
      }}
    />
  );
}
