/**
 * Module Resolver for Packaged Apps
 *
 * Provides a configured require function that can resolve modules from
 * app.asar.unpacked in production builds.
 */

import { createRequire } from 'module';
import { join } from 'path';

// Create base require
const baseRequire = createRequire(import.meta.url);

// Configure module paths for production
if (process.resourcesPath) {
  const unpackedModulesPath = join(process.resourcesPath, 'app.asar.unpacked', 'node_modules');

  // Add to Node's global module paths
  const Module = baseRequire('module') as any;
  if (!Module.globalPaths.includes(unpackedModulesPath)) {
    Module.globalPaths.push(unpackedModulesPath);
  }
}

/**
 * Enhanced require that can resolve modules from app.asar.unpacked
 */
export function requireModule(moduleName: string): any {
  try {
    return baseRequire(moduleName);
  } catch (error) {
    // If module not found and we're in production, try from unpacked path
    if (process.resourcesPath && (error as any).code === 'MODULE_NOT_FOUND') {
      const unpackedModulePath = join(
        process.resourcesPath,
        'app.asar.unpacked',
        'node_modules',
        moduleName
      );
      return baseRequire(unpackedModulePath);
    }
    throw error;
  }
}

// Export for convenience
export const moduleRequire = requireModule;
