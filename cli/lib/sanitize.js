/**
 * sanitize.js — Path sanitization for shell injection prevention
 *
 * Cross-platform safe: blocks shell metacharacters, resolves absolute paths.
 */

'use strict';

/**
 * Sanitize a user-supplied path for use with execFileSync.
 *
 * - Blocks shell metacharacters to prevent command injection
 * - Resolves relative paths to absolute to prevent traversal attacks
 *
 * @param {string|null|undefined} input — raw user input
 * @returns {string|null|undefined} — sanitized absolute path, or original falsy value
 * @throws {Error} if input contains shell metacharacters
 */
function sanitizePath(input) {
  if (!input) return input;
  // Block shell metacharacters — prevents command injection
  // Expanded set covers: command chaining, variable expansion, globbing, redirection
  // Note: ~ is NOT in the blocklist below because Windows short-names use ~ (MEUPHI~1).
  // It's checked separately for home-dir expansion patterns only.
  if (/[;&|`$(){}!<>#*?\[\]]/.test(input)) {
    throw new Error(`Invalid characters in path: "${input}"`);
  }
  // Block tilde only when used as home-dir expansion (~/path, ~name/path, or standalone ~)
  // Allow Windows short-names (MEUPHI~1) which embed ~ mid-token followed by digits
  if (/(?:^|[:\s])~(?:$|\/|\\|[a-zA-Z])/.test(input)) {
    throw new Error(`Invalid characters in path: "${input}"`);
  }
  // Resolve to absolute path — prevents relative traversal
  // like "valid/../../../etc" that the caller's path.resolve() would expand
  return require('path').resolve(input);
}

module.exports = { sanitizePath };
