import React, { startTransition, useEffect, useRef, useState } from 'react';

export interface TypewriterLine {
  text: string;
  italic?: boolean;
}

interface TypewriterProps {
  lines: TypewriterLine[];
  charDelayMs?: number;
  lineDelayMs?: number;
  startDelayMs?: number;
  active?: boolean;
  onComplete?: () => void;
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Types out each line character by character, mirroring the reveal used on the
 * Post app hero. The finished copy is always present in the DOM for crawlers and
 * screen readers; only the visible layer is animated.
 */
export default function Typewriter({
  lines,
  charDelayMs = 79,
  lineDelayMs = 525,
  startDelayMs = 0,
  active = true,
  onComplete,
}: TypewriterProps) {
  const [progress, setProgress] = useState({ line: 0, char: 0 });
  const [complete, setComplete] = useState(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (!active) return;

    if (prefersReducedMotion()) {
      startTransition(() => {
        setProgress({ line: lines.length, char: 0 });
        setComplete(true);
        onCompleteRef.current?.();
      });
      return;
    }

    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    let line = 0;
    let char = 0;

    const step = () => {
      if (cancelled) return;
      const text = lines[line].text;
      if (char < text.length) {
        char += 1;
        startTransition(() => setProgress({ line, char }));
        timers.push(setTimeout(step, charDelayMs));
      } else {
        line += 1;
        char = 0;
        const finished = line >= lines.length;
        startTransition(() => {
          setProgress({ line, char });
          if (finished) setComplete(true);
        });
        if (finished) {
          startTransition(() => onCompleteRef.current?.());
          return;
        }
        timers.push(setTimeout(step, lineDelayMs));
      }
    };

    timers.push(setTimeout(step, startDelayMs));

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [active, lines, charDelayMs, lineDelayMs, startDelayMs]);

  const renderLine = (
    line: TypewriterLine,
    content: React.ReactNode,
    key: number,
    withBreak: boolean
  ) => (
    <React.Fragment key={key}>
      {withBreak && <br />}
      {line.italic ? <em>{content}</em> : content}
    </React.Fragment>
  );

  const fullText = lines.map((line) => line.text).join(' ');

  return (
    <span className="relative block">
      <span className="sr-only">{fullText}</span>

      <span aria-hidden="true" className="invisible">
        {lines.map((line, i) => renderLine(line, line.text, i, i > 0))}
      </span>

      <span aria-hidden="true" className="absolute inset-0">
        {lines.map((line, i) => {
          const isPast = i < progress.line;
          const isCurrent = i === progress.line;
          if (!isPast && !isCurrent) return null;

          const visible = isPast ? line.text : line.text.slice(0, progress.char);
          const showCaret = active && isCurrent && !complete;

          return renderLine(
            line,
            <>
              {visible}
              {showCaret && <span className="freesurf-caret">|</span>}
            </>,
            i,
            i > 0
          );
        })}
      </span>
    </span>
  );
}
