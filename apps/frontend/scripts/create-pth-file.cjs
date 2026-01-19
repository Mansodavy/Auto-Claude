/**
 * Create a .pth file to add site-packages to Python's sys.path
 *
 * This is more robust than PYTHONPATH because:
 * 1. .pth files are processed automatically by Python on startup
 * 2. They work regardless of how Python is launched
 * 3. They don't depend on environment variables being set correctly
 */

const fs = require('fs');
const path = require('path');

const platform = process.platform;
const arch = process.arch;

// Determine platform-arch string (e.g., "win-x64", "darwin-arm64")
const platformArch = platform === 'win32' ? `win-${arch}` :
                     platform === 'darwin' ? `darwin-${arch}` :
                     `linux-${arch}`;

// Path to the Python installation in the bundle
const pythonDir = path.join(__dirname, '..', 'python-runtime', platformArch, 'python');

if (!fs.existsSync(pythonDir)) {
  console.log('[create-pth] Python directory not found, skipping .pth file creation');
  process.exit(0);
}

// For Windows, the .pth file goes in the root of the Python installation
// For Unix, it goes in lib/pythonX.Y/site-packages/
let pthDir;
if (platform === 'win32') {
  pthDir = pythonDir;
} else {
  // Find the Python version directory
  const libDir = path.join(pythonDir, 'lib');
  if (fs.existsSync(libDir)) {
    const pythonVersionDirs = fs.readdirSync(libDir).filter(d => d.startsWith('python'));
    if (pythonVersionDirs.length > 0) {
      pthDir = path.join(libDir, pythonVersionDirs[0], 'site-packages');
    } else {
      console.warn('[create-pth] No python version directory found in lib/');
      pthDir = libDir;
    }
  } else {
    console.warn('[create-pth] lib directory not found');
    pthDir = pythonDir;
  }
}

// Create the .pth file
const pthFile = path.join(pthDir, 'auto-claude-packages.pth');

// The path is relative to where Python is installed
// When packaged, python is in resources/python/ and site-packages is in resources/python-site-packages/
const relativePathToSitePackages = '../python-site-packages';

const pthContent = `# Auto-Claude bundled packages
${relativePathToSitePackages}
${relativePathToSitePackages}/win32
${relativePathToSitePackages}/win32/lib
`;

try {
  fs.writeFileSync(pthFile, pthContent, 'utf-8');
  console.log(`[create-pth] Created ${pthFile}`);
  console.log(`[create-pth] Content:\n${pthContent}`);
} catch (error) {
  console.error('[create-pth] Error creating .pth file:', error);
  process.exit(1);
}
