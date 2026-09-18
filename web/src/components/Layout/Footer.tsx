import React from 'react';
import { ECOSYSTEM_TOOLS, ECOSYSTEM_GITHUB } from '../../config/ecosystem';

interface FooterProps {
  navigate?: (path: string) => void;
}

export default function Footer({ navigate }: FooterProps) {
  const handleInternalNav = (event: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    if (!navigate) return;
    event.preventDefault();
    navigate(path);
  };

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <img
                src="/logo-white.svg"
                alt="FreeSurf logo"
                className="h-12 w-auto object-contain"
              />
              <h3 className="text-xl font-bold">FreeSurf</h3>
            </div>
            <p className="text-gray-300 mb-4">
              FreeSurf is a free, open-source platform connecting clients and
              contractors directly. No middleman fees, no subscriptions necessary.
            </p>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">For Clients</h4>
            <ul className="space-y-2 text-gray-300">
              <li>
                <a
                  href="/"
                  onClick={(event) => handleInternalNav(event, '/')}
                  className="hover:text-white transition-colors"
                >
                  Find a Pro
                </a>
              </li>
              <li>
                <a
                  href="/resources#client-resources"
                  onClick={(event) => handleInternalNav(event, '/resources#client-resources')}
                  className="hover:text-white transition-colors"
                >
                  Client Resources
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">For Contractors</h4>
            <ul className="space-y-2 text-gray-300">
              <li>
                <a
                  href="/join-as-contractor"
                  onClick={(event) => handleInternalNav(event, '/join-as-contractor')}
                  className="hover:text-white transition-colors"
                >
                  Join the Network
                </a>
              </li>
              <li>
                <a
                  href="/login"
                  onClick={(event) => handleInternalNav(event, '/login')}
                  className="hover:text-white transition-colors"
                >
                  Contractor Login
                </a>
              </li>
              <li>
                <a
                  href="/support"
                  onClick={(event) => handleInternalNav(event, '/support')}
                  className="hover:text-white transition-colors"
                >
                  Support
                </a>
              </li>
              <li>
                <a
                  href="/resources#contractor-resources"
                  onClick={(event) => handleInternalNav(event, '/resources#contractor-resources')}
                  className="hover:text-white transition-colors"
                >
                  Contractor Resources
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">FreeSurf Tools</h4>
            <ul className="space-y-2 text-gray-300">
              {ECOSYSTEM_TOOLS.map((tool) =>
                tool.href ? (
                  <li key={tool.name}>
                    <a
                      href={tool.href}
                      title={tool.description}
                      className="hover:text-white transition-colors"
                    >
                      {tool.name}
                    </a>
                  </li>
                ) : (
                  <li key={tool.name} title={tool.description} className="text-gray-500">
                    {tool.name}
                  </li>
                )
              )}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              Â© {new Date().getFullYear()} FreeSurf. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-2 sm:mt-0">
              <a
                href={ECOSYSTEM_GITHUB}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                GitHub
              </a>
              <a href="https://freesurf.tools/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">
                Privacy Policy
              </a>
              <a href="https://freesurf.tools/terms" className="text-gray-400 hover:text-white text-sm transition-colors">
                Terms of Use
              </a>
              <a href="https://freesurf.tools/eula" className="text-gray-400 hover:text-white text-sm transition-colors">
                EULA
              </a>
              <a
                href="/support"
                onClick={(event) => handleInternalNav(event, '/support')}
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
