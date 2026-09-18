#!/bin/bash
# Script to verify Netlify deployment

echo "🔍 Checking deployed version..."
echo ""

# Check which bundle is deployed
BUNDLE=$(curl -s https://cashmarket.io/ | grep -oP 'index-[^\.]+\.js' | head -1)
echo "📦 Bundle name: $BUNDLE"

if [[ "$BUNDLE" == "index-DNC01umY.js" ]]; then
    echo "✅ NEW optimized bundle detected (29KB)"
elif [[ "$BUNDLE" == "index-BRWRBTia.js" ]]; then
    echo "❌ OLD unoptimized bundle still deployed (291KB)"
    echo "   Netlify may still be building or using cached artifacts"
else
    echo "⚠️  Unknown bundle: $BUNDLE"
fi

echo ""

# Check for preconnect hints
PRECONNECTS=$(curl -s https://cashmarket.io/ | grep -c 'rel="preconnect"')
echo "🔗 Preconnect hints found: $PRECONNECTS"

if [[ $PRECONNECTS -ge 5 ]]; then
    echo "✅ Preconnect hints are present"
else
    echo "❌ Preconnect hints missing (expected 5+, found $PRECONNECTS)"
fi

echo ""

# Check bundle size
if [[ "$BUNDLE" != "" ]]; then
    SIZE=$(curl -s -w '%{size_download}' -o /dev/null "https://cashmarket.io/assets/$BUNDLE")
    SIZE_KB=$((SIZE / 1024))
    echo "📊 Main bundle size: ${SIZE_KB}KB"
    
    if [[ $SIZE_KB -lt 50 ]]; then
        echo "✅ Bundle size is optimized (< 50KB)"
    elif [[ $SIZE_KB -lt 150 ]]; then
        echo "⚠️  Bundle size is moderate (50-150KB)"
    else
        echo "❌ Bundle size is large (> 150KB)"
    fi
fi

echo ""
echo "🎯 Summary:"
if [[ "$BUNDLE" == "index-DNC01umY.js" ]] && [[ $PRECONNECTS -ge 5 ]] && [[ $SIZE_KB -lt 50 ]]; then
    echo "✅ Deployment is fully optimized!"
    echo "   Run Lighthouse now to see improved scores."
else
    echo "⏳ Deployment not fully optimized yet."
    echo "   Wait 2-3 minutes and run this script again."
    echo "   Or check Netlify deploy logs at: https://app.netlify.com"
fi
