#!/bin/bash
# Bump the version number in version.txt
# Usage: ./scripts/bump_version.sh [patch|minor|major]

set -e

BUMP_TYPE="${1:-patch}"

# Navigate to project root if we're in scripts dir
if [ -d "../src" ]; then
    cd ..
fi

# Read current version
CURRENT_VERSION=$(cat version.txt | tr -d '[:space:]')
echo "Current version: $CURRENT_VERSION"

# Use Python with semver to bump version
NEW_VERSION=$(python3 -c "
import semver
v = semver.VersionInfo.parse('$CURRENT_VERSION')
if '$BUMP_TYPE' == 'major':
    v = v.bump_major()
elif '$BUMP_TYPE' == 'minor':
    v = v.bump_minor()
else:
    v = v.bump_patch()
print(str(v))
")

echo "New version: $NEW_VERSION"

# Write new version
echo "$NEW_VERSION" > version.txt

echo "✅ Version bumped from $CURRENT_VERSION to $NEW_VERSION"
