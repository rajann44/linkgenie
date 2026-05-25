#!/bin/bash
# package-extension.sh — Creates a clean ZIP for Chrome Web Store submission

EXTENSION_NAME="linkgenie"
VERSION=$(node -p "require('./manifest.json').version")
OUTPUT="${EXTENSION_NAME}-v${VERSION}.zip"

# Remove old package
rm -f "$OUTPUT"

# Run build script to ensure latest code is compiled and minified
echo "Running build..."
npm run build

# Create ZIP excluding dev files
echo "Packaging extension..."
zip -r "$OUTPUT" . \
  -x ".git/*" \
  -x "node_modules/*" \
  -x ".env" \
  -x "*.map" \
  -x "src/content.ts" \
  -x "src/background.ts" \
  -x "src/options.ts" \
  -x "src/patch.ts" \
  -x "tsconfig.json" \
  -x "package.json" \
  -x "package-lock.json" \
  -x "build.js" \
  -x "package-extension.sh" \
  -x ".DS_Store" \
  -x "Thumbs.db"

echo "Packaged successfully: $OUTPUT ($(du -h "$OUTPUT" | cut -f1))"
