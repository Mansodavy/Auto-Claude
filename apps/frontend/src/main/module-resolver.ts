import { createRequire } from 'module';
import { join } from 'path';

const baseRequire = createRequire(import.meta.url);

// Add unpacked modules path to global module search paths
if (process.resourcesPath) {
  const unpackedModulesPath = join(process.resourcesPath, 'app.asar.unpacked', 'node_modules');
  const Module = baseRequire('module') as any;
  if (!Module.globalPaths.includes(unpackedModulesPath)) {
    Module.globalPaths.push(unpackedModulesPath);
  }
}

/**
 * Require a module, falling back to app.asar.unpacked if not found
 * This is needed because some modules can't be bundled in ASAR
 */
export function requireModule(moduleName: string): any {
  try {
    return baseRequire(moduleName);
  } catch (error) {
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
