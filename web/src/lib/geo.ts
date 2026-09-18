import { useEffect, useState } from 'react';

export interface InferredLocation {
  zip: string;
  city: string;
  region: string;
}

const EMPTY: InferredLocation = { zip: '', city: '', region: '' };

let cached: InferredLocation | null = null;
let inflight: Promise<InferredLocation> | null = null;

// Fetches the visitor's approximate location once per session and caches it.
// Backed by /api/geo, which reads Cloudflare's request metadata.
export const fetchInferredLocation = (): Promise<InferredLocation> => {
  if (cached) return Promise.resolve(cached);
  if (!inflight) {
    inflight = fetch('/api/geo')
      .then((res) => res.json())
      .then((data) => {
        cached = {
          zip: data?.zip ? String(data.zip) : '',
          city: data?.city ? String(data.city) : '',
          region: data?.region ? String(data.region) : '',
        };
        return cached;
      })
      .catch(() => {
        cached = EMPTY;
        return EMPTY;
      });
  }
  return inflight;
};

export const useInferredLocation = (): InferredLocation => {
  const [location, setLocation] = useState<InferredLocation>(cached ?? EMPTY);

  useEffect(() => {
    let cancelled = false;
    fetchInferredLocation().then((next) => {
      if (!cancelled) setLocation(next);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return location;
};
