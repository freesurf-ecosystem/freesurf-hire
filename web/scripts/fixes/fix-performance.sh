#!/bin/bash
# Performance fix script - replaces Next.js imports with React Router equivalents

echo "Fixing Next.js router imports to use React Router instead..."

# Fix useRouter imports
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i "s/import { useRouter } from 'next\/router'/import { useNavigate } from 'react-router-dom'/g" {} \;
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i 's/const router = useRouter()/const navigate = useNavigate()/g' {} \;
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i 's/router\.push(/navigate(/g' {} \;
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i 's/router\.replace(/navigate(/g' {} \;

# Fix next/link imports
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i "s/import Link from 'next\/link'/import { Link } from 'react-router-dom'/g" {} \;

# Fix next/navigation imports  
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i "s/import { usePathname } from 'next\/navigation'/import { useLocation } from 'react-router-dom'/g" {} \;
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i 's/const pathname = usePathname()/const location = useLocation(); const pathname = location.pathname/g' {} \;

echo "Done! Next.js imports have been replaced with React Router."
echo "Note: Manual fixes may still be needed for:"
echo "  - next/dynamic usage (replace with React.lazy)"
echo "  - next/head usage (remove or use react-helmet)"
echo "  - Link href props may need to be changed to 'to' props"
