#!/usr/bin/env python3
"""
Fix LandingPage.tsx for performance - remove delays, fix imports
"""

file_path = "src/components/LandingPage.tsx"

with open(file_path, 'r') as f:
    content = f.read()

# 1. Fix imports
content = content.replace(
    "import { useState, useEffect } from 'react';",
    "import { useState, useEffect, lazy, Suspense } from 'react';"
)
content = content.replace(
    "import { useRouter } from 'next/router';",
    "import { useNavigate } from 'react-router-dom';"
)
content = content.replace("import Head from 'next/head';\n", "")
content = content.replace(
    "import dynamic from 'next/dynamic';\n\n// Lazy load Footer since it's below the fold\nconst Footer = dynamic(() => import('./Layout/Footer'), {\n  loading: () => <div style={{ height: '200px' }} />, // Prevent layout shift\n});",
    "// Lazy load Footer since it's below the fold\nconst Footer = lazy(() => import('./Layout/Footer'));"
)

# 2. Fix router usage
content = content.replace("const router = useRouter();", "const navigate = useNavigate();")
content = content.replace(
    "  const [showPropertyTypes, setShowPropertyTypes] = useState(false);\n  const [usStates, setUsStates] = useState<Array<{name: string, abbr: string}>>([]);",
    "  // Initialize states immediately - no delay\n  const usStates = getUSStates();"
)

# 3. Remove setTimeout delay
old_effect = """  // Delay loading of non-critical content to improve initial page speed
  useEffect(() => {
    // Preload the hero background image
    const img = new Image();
    img.onload = () => setIsImageLoaded(true);
    img.src = "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=1600";

    // Delay loading property types and states data to prioritize above-the-fold content
    const timer = setTimeout(() => {
      setShowPropertyTypes(true);
      setUsStates(getUSStates()); // Load states data lazily
    }, 150);

    return () => clearTimeout(timer);
  }, []);"""

new_effect = """  // Preload the hero background image only
  useEffect(() => {
    const img = new Image();
    img.onload = () => setIsImageLoaded(true);
    img.src = "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=1600";
  }, []);"""

content = content.replace(old_effect, new_effect)

# 4. Simplify navigation
old_nav = """      try {
        // Use Next.js router for navigation
        router.push(seoUrl);
        
        // Add a small delay to check if navigation worked
        setTimeout(() => {
          if (window.location.pathname === '/') {
            window.location.href = seoUrl;
          }
        }, 100);
        
      } catch {
        // Navigation error - fallback to window.location
        if (typeof window !== 'undefined') {
          window.location.href = seoUrl;
        }
      }"""

content = content.replace(old_nav, "      navigate(seoUrl);")

# 5. Remove Head component
content = content.replace(
    """  return (
    <>
      <Head>
        {/* Load critical CSS for LandingPage performance */}
        <link rel="stylesheet" href="/css/critical-landing.css" />
      </Head>
      <div className="min-h-screen bg-white">""",
    """  return (
    <div className="min-h-screen bg-white">"""
)

# 6. Fix Footer with Suspense
content = content.replace(
    """      {/* Footer */}
            <Footer navigate={router.push} />
      </div>
    </>
  );
}""",
    """      {/* Footer */}
      <Suspense fallback={<div style={{ height: '200px' }} />}>
        <Footer navigate={navigate} />
      </Suspense>
      </div>
  );
}"""
)

with open(file_path, 'w') as f:
    f.write(content)

print("✅ LandingPage.tsx optimized for performance!")
print("   - Removed 150ms setTimeout delay")
print("   - Fixed Next.js imports to use React Router")
print("   - Removed Head component")
print("   - Added Suspense for Footer lazy loading")
