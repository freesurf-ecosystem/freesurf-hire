#!/bin/bash
# Post-build script to add cache busting timestamp

TIMESTAMP=$(date +%s)
DIST_HTML="dist/index.html"

if [ -f "$DIST_HTML" ]; then
    echo "Adding cache buster timestamp: $TIMESTAMP"
    
    # Add timestamp query param to JS files
    sed -i "s|src=\"/assets/\([^\"]*\.js\)\"|src=\"/assets/\1?v=$TIMESTAMP\"|g" "$DIST_HTML"
    
    # Add timestamp query param to CSS files
    sed -i "s|href=\"/assets/\([^\"]*\.css\)\"|href=\"/assets/\1?v=$TIMESTAMP\"|g" "$DIST_HTML"
    
    echo "✅ Cache busters added to all assets"
else
    echo "❌ dist/index.html not found"
    exit 1
fi
