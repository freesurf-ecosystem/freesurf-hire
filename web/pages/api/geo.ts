import type { NextApiRequest, NextApiResponse } from 'next';
import { getCloudflareContext } from '@opennextjs/cloudflare';

interface GeoResponse {
  zip: string | null;
  city: string | null;
  region: string | null;
  regionCode: string | null;
}

// Returns the visitor's approximate location from Cloudflare's request metadata
// (`request.cf`). No third-party IP API. Empty values when unavailable (e.g.
// local dev, or when the visitor is on a VPN).
export default function handler(_req: NextApiRequest, res: NextApiResponse<GeoResponse>) {
  try {
    const { cf } = getCloudflareContext();
    const props = cf as IncomingRequestCfProperties | undefined;

    res.setHeader('Cache-Control', 'private, no-store');
    res.status(200).json({
      zip: props?.postalCode ?? null,
      city: props?.city ?? null,
      region: props?.region ?? null,
      regionCode: props?.regionCode ?? null,
    });
  } catch {
    res.status(200).json({ zip: null, city: null, region: null, regionCode: null });
  }
}
