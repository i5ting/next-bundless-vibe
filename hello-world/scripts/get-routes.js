#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Recursively finds all routes in the Next.js app directory
 * @param {string} dir - Directory to search
 * @param {string} basePath - Base path for the route
 * @returns {Array} Array of route objects
 */
function findRoutes(dir, basePath = '') {
  const routes = [];

  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        // Skip special Next.js directories
        if (entry.name.startsWith('_') || entry.name.startsWith('.')) {
          continue;
        }

        // Check if this directory contains a page.tsx or page.js
        const hasPage = fs.existsSync(path.join(fullPath, 'page.tsx')) ||
                       fs.existsSync(path.join(fullPath, 'page.js'));

        const routePath = `${basePath}/${entry.name}`;

        if (hasPage) {
          routes.push({
            path: routePath,
            type: 'page',
            directory: fullPath
          });
        }

        // Recursively search subdirectories
        routes.push(...findRoutes(fullPath, routePath));
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error.message);
  }

  return routes;
}

// Main execution
const appDir = path.join(process.cwd(), 'app');

console.log('🔍 Scanning for routes in Next.js App Router...\n');

// Check for root page
const hasRootPage = fs.existsSync(path.join(appDir, 'page.tsx')) ||
                    fs.existsSync(path.join(appDir, 'page.js'));

const routes = [];

if (hasRootPage) {
  routes.push({
    path: '/',
    type: 'page',
    directory: appDir
  });
}

// Find all other routes
routes.push(...findRoutes(appDir));

// Display results
if (routes.length === 0) {
  console.log('❌ No routes found');
} else {
  console.log(`✅ Found ${routes.length} route(s):\n`);

  routes.sort((a, b) => a.path.localeCompare(b.path));

  routes.forEach(route => {
    console.log(`  ${route.path}`);
    console.log(`    Type: ${route.type}`);
    console.log(`    Location: ${route.directory}`);
    console.log('');
  });
}
