/**
 * Spec-Driven Agent Framework
 * 
 * Main entry point for the npm package.
 * Use the CLI for installation: npx spec-driven-agent init
 */

const path = require('path');
const fs = require('fs');

// Framework version
const VERSION = '4.0.0';

// Get framework path
function getFrameworkPath() {
  return path.join(__dirname, 'templates');
}

// Check if framework is installed in current directory
function isInstalled(dir = process.cwd()) {
  const claudePath = path.join(dir, 'CLAUDE.md');
  const skillsPath = path.join(dir, 'skills');
  
  return fs.existsSync(claudePath) && fs.existsSync(skillsPath);
}

// Export utilities
module.exports = {
  VERSION,
  getFrameworkPath,
  isInstalled
};
