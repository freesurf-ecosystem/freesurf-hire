#!/bin/bash
# Fix LandingPage.tsx performance issues

FILE="src/components/LandingPage.tsx"

echo "Optimizing LandingPage.tsx for performance..."

# 1. Fix imports
sed -i "1s/.*/import { useState, useEffect, lazy, Suspense } from 'react';/" "$FILE"
sed -i "2s/.*/import { useNavigate } from 'react-router-dom';/" "$FILE"
sed -i "3d" "$FILE"  # Remove next/head import
sed -i "8s/.*/const Footer = lazy(() => import('.\/Layout\/Footer'));/" "$FILE"
sed -i "9,11d" "$FILE"  # Remove next/dynamic loading config

# 2. Fix router usage
sed -i "s/const router = useRouter()/const navigate = useNavigate()/" "$FILE"
sed -i "s/const \[showPropertyTypes, setShowPropertyTypes\] = useState(false);/\/\/ Initialize states immediately - no delay/" "$FILE"
sed -i "s/const \[usStates, setUsStates\] = useState<Array<{name: string, abbr: string}>>\(\[\]\);/const usStates = getUSStates();/" "$FILE"

# 3. Remove setTimeout delay in useEffect
sed -i "/Delay loading property types/,/return () => clearTimeout(timer);/c\  }, []);" "$FILE"

# 4. Simplify navigation
sed -i "/try {/,/}/c\      navigate(seoUrl);" "$FILE"

# 5. Remove Head component
sed -i "/<Head>/,/<\/Head>/d" "$FILE"  
sed -i "s/<>//" "$FILE"
sed -i "s/<\/>//" "$FILE"

# 6. Fix Footer with Suspense
sed -i "s/<Footer navigate={router.push} \/>/<Suspense fallback={<div style={{ height: '200px' }} \/>}>\n      <Footer navigate={navigate} \/>\n    <\/Suspense>/" "$FILE"

echo "Done! LandingPage.tsx optimized."
