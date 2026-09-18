/**
 * Navigation compatibility layer
 * Re-exports Next.js navigation hooks for component consistency
 */

import { useRouter } from 'next/router';

// Re-export useRouter as useNavigate for component compatibility
export const useNavigate = () => {
  const router = useRouter();
  return (path: string) => {
    router.push(path);
  };
};

export const useLocation = () => {
  const router = useRouter();
  
  return {
    pathname: router.asPath.split('?')[0],
    search: router.asPath.includes('?') ? '?' + router.asPath.split('?')[1] : '',
    hash: router.asPath.split('#')[1] ? '#' + router.asPath.split('#')[1] : '',
    state: null,
    key: 'default'
  };
};

// Re-export Next.js Link for component compatibility
export { default as Link } from 'next/link';
