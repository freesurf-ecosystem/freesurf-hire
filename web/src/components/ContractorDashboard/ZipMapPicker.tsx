import { useCallback, useEffect, useRef, useState } from 'react';
import type { Map as MapLibreMap, MapGeoJSONFeature } from 'maplibre-gl';

/**
 * Click-to-select zipcode map for the service area.
 *
 * Base map is OpenFreeMap (free vector tiles, no API key, no request limits).
 * Zipcode positions come from the Census 2020 ZCTA gazetteer, built by
 * scripts/geo/build-zip-centroids.mjs into public/data/zip-centroids.json.
 *
 * Selection is point-based rather than polygon-based: clicking picks the nearest
 * zipcode centroid. That keeps the payload at ~250 KB gzipped instead of tens of
 * megabytes of boundary geometry, and the hover readout names the zipcode before
 * you commit to it, so the interaction stays predictable.
 */

interface ZipMapPickerProps {
  selected: string[];
  onToggle: (zip: string) => void;
  /** Used to centre the map on first load. Falls back to the continental US. */
  centerZip?: string;
}

type Centroid = [string, number, number];

// Anything further than this from the click is treated as a miss, so clicking
// open water or another country does not silently select a distant zipcode.
const MAX_PICK_KM = 60;

const US_CENTER: [number, number] = [-98.5, 39.5];
const US_ZOOM = 3.6;

const toRad = (deg: number) => (deg * Math.PI) / 180;

// Equirectangular approximation. At zipcode scale the error versus haversine is
// well under a kilometre, and this runs on every mousemove.
const distanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1) * Math.cos(toRad((lat1 + lat2) / 2));
  return Math.sqrt(dLat * dLat + dLon * dLon) * 6371;
};

let centroidsPromise: Promise<Centroid[]> | null = null;
const loadCentroids = () => {
  if (!centroidsPromise) {
    centroidsPromise = fetch('/data/zip-centroids.json').then((res) => {
      if (!res.ok) throw new Error(`zip centroids: HTTP ${res.status}`);
      return res.json();
    });
  }
  return centroidsPromise;
};

let cityPromise: Promise<Record<string, string>> | null = null;
const loadCities = () => {
  if (!cityPromise) {
    cityPromise = import('../../data/zipToCity.json').then(
      (mod) => (mod.default ?? mod) as unknown as Record<string, string>
    );
  }
  return cityPromise;
};

export default function ZipMapPicker({ selected, onToggle, centerZip }: ZipMapPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const centroidsRef = useRef<Centroid[]>([]);
  const citiesRef = useRef<Record<string, string>>({});
  const selectedRef = useRef<string[]>(selected);
  // onToggle changes identity on every parent render, so keep it in a ref rather
  // than tearing down and rebuilding the whole map.
  const onToggleRef = useRef(onToggle);
  const [status, setStatus] = useState('Loading map...');
  const [hover, setHover] = useState<{ zip: string; place: string } | null>(null);
  const [ready, setReady] = useState(false);

  // Keep the latest selection available to the map's event handlers, which are
  // registered once and would otherwise close over the first render's value.
  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);

  useEffect(() => {
    onToggleRef.current = onToggle;
  }, [onToggle]);

  const placeFor = useCallback((zip: string) => {
    const place = citiesRef.current[zip];
    return place ? `${zip} - ${place}` : zip;
  }, []);

  const nearest = useCallback((lat: number, lon: number) => {
    let best: Centroid | null = null;
    let bestKm = Infinity;
    for (const c of centroidsRef.current) {
      const km = distanceKm(lat, lon, c[1], c[2]);
      if (km < bestKm) {
        bestKm = km;
        best = c;
      }
    }
    return best && bestKm <= MAX_PICK_KM ? { zip: best[0], km: bestKm } : null;
  }, []);

  useEffect(() => {
    let disposed = false;

    const init = async () => {
      const [maplibregl, centroids] = await Promise.all([import('maplibre-gl'), loadCentroids()]);
      if (disposed || !containerRef.current) return;

      centroidsRef.current = centroids;
      loadCities().then((cities) => {
        citiesRef.current = cities;
      });

      const features = centroids.map(([zip, lat, lon]) => ({
        type: 'Feature' as const,
        id: zip,
        properties: { zip },
        geometry: { type: 'Point' as const, coordinates: [lon, lat] },
      }));

      const start = centerZip ? centroids.find((c) => c[0] === centerZip) : undefined;

      const map = new maplibregl.Map({
        container: containerRef.current,
        style: 'https://tiles.openfreemap.org/styles/positron',
        center: start ? [start[2], start[1]] : US_CENTER,
        zoom: start ? 8 : US_ZOOM,
        attributionControl: { compact: true },
      });
      mapRef.current = map;

      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');

      map.on('load', () => {
        if (disposed) return;

        map.addSource('zips', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features },
          promoteId: 'zip',
        });

        // Unselected points fade in with zoom - at country scale 33k dots is
        // just noise, but the click-to-select logic works at any zoom.
        map.addLayer({
          id: 'zip-points',
          type: 'circle',
          source: 'zips',
          paint: {
            'circle-radius': ['interpolate', ['linear'], ['zoom'], 5, 1.5, 10, 5],
            'circle-color': '#2563eb',
            'circle-opacity': ['interpolate', ['linear'], ['zoom'], 4, 0, 6, 0.45, 8, 0.8],
            'circle-stroke-width': 0,
          },
        });

        map.addLayer({
          id: 'zip-selected',
          type: 'circle',
          source: 'zips',
          filter: ['==', ['get', 'zip'], ''],
          paint: {
            'circle-radius': ['interpolate', ['linear'], ['zoom'], 4, 5, 10, 11],
            'circle-color': '#16a34a',
            'circle-opacity': 0.95,
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff',
          },
        });

        const syncSelected = () => {
          const zips = selectedRef.current;
          map.setFilter('zip-selected', ['in', ['get', 'zip'], ['literal', zips.length ? zips : ['']]]);
        };
        syncSelected();
        map.on('moveend', syncSelected);

        setReady(true);
        setStatus('Click the map to add or remove a zipcode.');
      });

      const pick = (e: { lngLat: { lat: number; lng: number } }) => {
        const found = nearest(e.lngLat.lat, e.lngLat.lng);
        if (found) onToggleRef.current(found.zip);
      };

      // Clicking a visible dot should select that dot, not merely the nearest
      // centroid to the cursor - they are the same thing except when dots overlap.
      map.on('click', 'zip-points', (e) => {
        const feature = e.features?.[0] as MapGeoJSONFeature | undefined;
        const zip = feature?.properties?.zip;
        if (typeof zip === 'string') onToggleRef.current(zip);
      });

      map.on('click', (e) => {
        if (map.queryRenderedFeatures(e.point, { layers: ['zip-points'] }).length > 0) return;
        pick(e);
      });

      map.on('mousemove', (e) => {
        const found = nearest(e.lngLat.lat, e.lngLat.lng);
        setHover(found ? { zip: found.zip, place: placeFor(found.zip) } : null);
        map.getCanvas().style.cursor = found ? 'pointer' : '';
      });

      map.on('mouseleave', () => setHover(null));
    };

    init().catch((err) => {
      console.error('map init failed:', err);
      setStatus('The map could not be loaded. You can still add zipcodes by typing them.');
    });

    return () => {
      disposed = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reflect external selection changes (e.g. a zip removed from the chip list).
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    map.setFilter('zip-selected', ['in', ['get', 'zip'], ['literal', selected.length ? selected : ['']]]);
  }, [selected, ready]);

  return (
    <div className="overflow-hidden rounded-lg border border-gray-300">
      <div ref={containerRef} className="h-80 w-full bg-gray-100" />
      <div className="flex items-center justify-between gap-3 border-t border-gray-200 bg-gray-50 px-3 py-2 text-xs">
        <span className="text-gray-600">{status}</span>
        <span className="font-medium text-gray-900">
          {hover ? `Add ${hover.place}` : `${selected.length} selected`}
        </span>
      </div>
    </div>
  );
}
